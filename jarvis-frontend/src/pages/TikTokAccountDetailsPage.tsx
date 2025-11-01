import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { usePosts } from "../features/posts/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import PostList from "@/features/posts/components/PostList";
import { useSyncTikTokVideos } from "../features/tiktok/hooks/useSyncTikTokVideos";
import { useFetchVideoAnalytics } from "../features/analytics/hooks/useFetchVideoAnalytics";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/RefreshButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AccountAnalyticsGraph from "../features/analytics/components/AccountAnalyticsGraph";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { queries } from "@/lib/queries";
import { Separator } from "@/components/ui/separator";
import { getLatestAnalytics } from "../features/posts/utils/getLatestAnalytics";
import { useTikTokAccountAnalytics } from "../features/tiktok/hooks/useTikTokAccountAnalytics";

type SortOrder = "recency" | "views" | "likes" | "comments" | "shares";

const TikTokAccountDetailsPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const queryClient = useQueryClient();
  const { data: accounts, isLoading: isLoadingAccounts } = useTikTokAccounts();
  const account = accounts?.find((acc) => acc.id === accountId);

  const { mutate: syncVideos, isPending: isSyncing } = useSyncTikTokVideos();
  const { data: posts, isLoading, isError, error } = usePosts({ accountId: accountId, status: "PUBLISHED" });
  const { mutate: fetchAnalytics, isPending: isFetchingAnalytics } = useFetchVideoAnalytics();
  const { data: accountAnalytics, isLoading: isLoadingAccountAnalytics } = useTikTokAccountAnalytics(accountId);

  const [sortOrder, setSortOrder] = useState<SortOrder>("recency");
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleRefresh = () => {
    if (account?.id) {
      queryClient.invalidateQueries({
        queryKey: queries.tiktokAccountAnalytics.detail(account.id).queryKey,
      });
      if (posts && posts.length > 0) {
        fetchAnalytics({ accountId: account.id, postIds: posts.map((p) => p.post_id) });
      }
    }
  };

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    const sorted = [...posts];
    switch (sortOrder) {
      case "views":
        return sorted.sort(
          (a, b) =>
            (getLatestAnalytics(b.post_analytics)?.views || 0) - (getLatestAnalytics(a.post_analytics)?.views || 0)
        );
      case "likes":
        return sorted.sort(
          (a, b) =>
            (getLatestAnalytics(b.post_analytics)?.likes || 0) - (getLatestAnalytics(a.post_analytics)?.likes || 0)
        );
      case "comments":
        return sorted.sort(
          (a, b) =>
            (getLatestAnalytics(b.post_analytics)?.comments || 0) -
            (getLatestAnalytics(a.post_analytics)?.comments || 0)
        );
      case "shares":
        return sorted.sort(
          (a, b) =>
            (getLatestAnalytics(b.post_analytics)?.shares || 0) - (getLatestAnalytics(a.post_analytics)?.shares || 0)
        );
      case "recency":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [posts, sortOrder]);

  const kpis = useMemo(() => {
    if (!posts) return { views: 0, likes: 0, comments: 0, shares: 0 };
    return posts.reduce(
      (acc, post) => {
        const latestAnalytics = getLatestAnalytics(post.post_analytics);
        if (latestAnalytics) {
          acc.views += latestAnalytics.views || 0;
          acc.likes += latestAnalytics.likes || 0;
          acc.comments += latestAnalytics.comments || 0;
          acc.shares += latestAnalytics.shares || 0;
        }
        return acc;
      },
      { views: 0, likes: 0, comments: 0, shares: 0 }
    );
  }, [posts]);

  if (isLoading || isLoadingAccounts) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">TikTok Videos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-red-600">{error?.message}</p>
      </div>
    );
  }
  if (!account) {
    return null;
  }

  const lastImportDate = account.last_video_import_at ? new Date(account.last_video_import_at) : null;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isRateLimited = lastImportDate && lastImportDate > sevenDaysAgo;
  const nextAvailableImport = lastImportDate ? new Date(lastImportDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

  return (
    <div className="p-6 space-y-8">
      <PageHeader title={account.tiktok_display_name || ""}></PageHeader>

      <div className="max-w-[80vw] mx-auto space-y-8">
        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center w-full space-y-2 text-center">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage
                    src={account.tiktok_avatar_url ?? undefined}
                    alt={account.tiktok_display_name ?? undefined}
                  />
                  <AvatarFallback>{account.tiktok_display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{account.tiktok_display_name}</h1>
                  <a
                    href={`https://www.tiktok.com/@${account.tiktok_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:underline">
                    @{account.tiktok_username}
                  </a>
                </div>
              </div>
              <div className="my-6 border-t border-border" />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="text-2xl font-bold">{accountAnalytics?.follower_count?.toLocaleString() ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Likes</p>
                  <p className="text-2xl font-bold">{accountAnalytics?.likes_count?.toLocaleString() ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Videos</p>
                  <p className="text-2xl font-bold">{accountAnalytics?.video_count?.toLocaleString() ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Following</p>
                  <p className="text-2xl font-bold">{accountAnalytics?.following_count?.toLocaleString() ?? "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Follower History</CardTitle>
            </CardHeader>
            <CardContent>{accountId && <AccountAnalyticsGraph accountId={accountId} />}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Views</h3>
                <p>{kpis.views.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Likes</h3>
                <p>{kpis.likes.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Comments</h3>
                <p>{kpis.comments.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Shares</h3>
                <p>{kpis.shares.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                Videos <span className="text-sm text-muted-foreground">({posts?.length ?? 0})</span>
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSettingsModalOpen(true)}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <RefreshButton onClick={handleRefresh} isRefreshing={isFetchingAnalytics || isLoadingAccountAnalytics} />
              <Select onValueChange={(value) => setSortOrder(value as SortOrder)} defaultValue={sortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recency">Most Recent</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="likes">Most Likes</SelectItem>
                  <SelectItem value="comments">Most Comments</SelectItem>
                  <SelectItem value="shares">Most Shares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          {/* <div className="max-w-[0vw] mx-auto"> */}
          <div className="">
            {sortedPosts.length > 0 ? (
              <PostList posts={sortedPosts} variant="published" />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No Videos Found</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Sync with TikTok to see your videos and analytics here.
                </p>
                <Button onClick={() => syncVideos(account.id)} disabled={isSyncing || isRateLimited || false}>
                  {isSyncing ? "Syncing..." : "Sync Account Videos"}
                </Button>
                {isRateLimited && nextAvailableImport && (
                  <p className="text-sm text-muted-foreground mt-2">
                    You can import videos again on {nextAvailableImport.toLocaleDateString()}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Analytics Information</DialogTitle>
            <DialogDescription>
              We keep a copy of your posts to track analytics over time. This allows us to provide you with historical
              data and insights into your content's performance.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              If you notice that some of your videos are missing from the list, you can perform a manual resync to fetch
              the latest content from your TikTok account.
            </p>
          </div>
          <DialogFooter>
            <div className="flex flex-col w-full">
              <Button onClick={() => syncVideos(account.id)} disabled={isSyncing || isRateLimited || false}>
                {isSyncing ? "Syncing..." : "Resync Videos"}
              </Button>
              {isRateLimited && nextAvailableImport && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  You can import videos again on {nextAvailableImport.toLocaleDateString()}.
                </p>
              )}
            </div>
            <Button variant="secondary" onClick={() => setSettingsModalOpen(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TikTokAccountDetailsPage;
