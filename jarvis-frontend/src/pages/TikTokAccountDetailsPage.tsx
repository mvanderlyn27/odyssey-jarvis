import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { usePosts } from "../features/posts/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/features/analytics/components/PostCard";
import { useSyncTikTokVideos } from "../features/tiktok/hooks/useSyncTikTokVideos";
import { useFetchVideoAnalytics } from "../features/analytics/hooks/useFetchVideoAnalytics";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/layout/PageHeader";
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
import { AccountAnalyticsKPIs } from "../features/tiktok/components/AccountAnalyticsKPIs";
import AccountAnalyticsGraph from "../features/analytics/components/AccountAnalyticsGraph";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw, Settings } from "lucide-react";
import { queries } from "@/lib/queries";

type SortOrder = "recency" | "views" | "likes" | "comments" | "shares";

const TikTokAccountDetailsPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: accounts, isLoading: isLoadingAccounts } = useTikTokAccounts();
  const account = accounts?.find((acc) => acc.id === accountId);

  const { mutate: syncVideos, isPending: isSyncing } = useSyncTikTokVideos();
  const { data: posts, isLoading, isError, error } = usePosts({ accountId: accountId, status: "PUBLISHED" });
  const { mutate: fetchAnalytics, isPending: isFetchingAnalytics } = useFetchVideoAnalytics();

  const [sortOrder, setSortOrder] = useState<SortOrder>("recency");
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (account?.id && posts && posts.length > 0) {
      fetchAnalytics({ accountId: account.id, postIds: posts.map((p) => p.post_id) });
    }
  }, [posts, account, fetchAnalytics]);

  const handleRefresh = () => {
    if (account?.id) {
      queryClient.invalidateQueries({
        queryKey: queries.posts.byStatus("PUBLISHED", [account.id]).queryKey,
      });
    }
  };

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    const sorted = [...posts];
    switch (sortOrder) {
      case "views":
        return sorted.sort((a, b) => (b.post_analytics?.[0]?.views || 0) - (a.post_analytics?.[0]?.views || 0));
      case "likes":
        return sorted.sort((a, b) => (b.post_analytics?.[0]?.likes || 0) - (a.post_analytics?.[0]?.likes || 0));
      case "comments":
        return sorted.sort((a, b) => (b.post_analytics?.[0]?.comments || 0) - (a.post_analytics?.[0]?.comments || 0));
      case "shares":
        return sorted.sort((a, b) => (b.post_analytics?.[0]?.shares || 0) - (a.post_analytics?.[0]?.shares || 0));
      case "recency":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [posts, sortOrder]);

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

  return (
    <div className="p-4 space-y-8">
      <PageHeader title={account.tiktok_display_name || ""}>
        <RefreshButton onClick={handleRefresh} isRefreshing={isFetchingAnalytics} />
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
      </PageHeader>

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
                <p className="text-muted-foreground">@{account.tiktok_username}</p>
              </div>
            </div>
            <div className="my-6 border-t border-border" />
            <AccountAnalyticsKPIs accountId={accountId} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Follower History</CardTitle>
          </CardHeader>
          <CardContent>{accountId && <AccountAnalyticsGraph accountId={accountId} />}</CardContent>
        </Card>
      </div>

      {/* Video Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Videos</h2>
            <Button variant="ghost" size="icon" onClick={() => setSettingsModalOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Total Videos: {posts?.length ?? 0}</p>
          </div>
        </div>

        {sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Videos Found</h3>
            <p className="text-muted-foreground mt-2 mb-4">Sync with TikTok to see your videos and analytics here.</p>
            <Button onClick={() => syncVideos(account.id)} disabled={isSyncing}>
              {isSyncing ? "Syncing..." : "Sync Account Videos"}
            </Button>
          </div>
        )}
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
            <Button onClick={() => syncVideos(account.id)} disabled={isSyncing}>
              {isSyncing ? "Syncing..." : "Resync Videos"}
            </Button>
            <Button variant="secondary" onClick={() => setSettingsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TikTokAccountDetailsPage;
