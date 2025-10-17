import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { usePosts } from "../features/posts/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/features/analytics/components/PostCard";
import { useSyncTikTokVideos } from "../features/tiktok/hooks/useSyncTikTokVideos";
import { useFetchVideoAnalytics } from "../features/analytics/hooks/useFetchVideoAnalytics";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountAnalyticsKPIs } from "../features/tiktok/components/AccountAnalyticsKPIs";

type SortOrder = "recency" | "views" | "likes" | "comments" | "shares";

const TikTokAccountDetailsPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { data: accounts } = useTikTokAccounts();
  const account = accounts?.find((acc) => acc.id === accountId);

  const { mutate: syncVideos } = useSyncTikTokVideos();
  console.log("account", accounts, accountId);

  const { data: posts, isLoading, isError, error } = usePosts({ accountId: accountId, status: "PUBLISHED" });
  const { mutate: fetchAnalytics } = useFetchVideoAnalytics();
  const [sortOrder, setSortOrder] = useState<SortOrder>("recency");

  useEffect(() => {
    if (account?.id && posts && posts.length > 0) {
      fetchAnalytics({ accountId: account.id, postIds: posts.map((p) => p.post_id) });
    }
  }, [posts, account, fetchAnalytics]);

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

  if (isLoading) {
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
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate(-1)}>Back</Button>
        <h1 className="text-2xl font-bold text-center">Videos for {account?.tiktok_display_name ?? "..."}</h1>
        {/* Spacer */}
        <div />
      </div>

      {/* KPI Cards */}
      <AccountAnalyticsKPIs accountId={accountId} />

      {/* Controls */}
      <div className="flex justify-end items-center gap-4">
        <p>Total Videos: {posts?.length ?? 0}</p>
        <Button onClick={() => syncVideos(account.id)}>Resync Videos</Button>
        <Button
          onClick={() => {
            if (account?.id && posts) {
              fetchAnalytics({ accountId: account.id, postIds: posts.map((p) => p.post_id) });
            }
          }}>
          Refresh Stats
        </Button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedPosts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default TikTokAccountDetailsPage;
