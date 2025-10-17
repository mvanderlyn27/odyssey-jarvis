import { useEffect, useMemo, useState } from "react";
import AccountSelector from "../components/tiktok/AccountSelector";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { PostCard } from "@/features/analytics/components/PostCard";

const TikTokAnalyticsPage = () => {
  const selectedAccounts = useAnalyticsStore((state) => state.selectedAccounts);
  const setSelectedAccounts = useAnalyticsStore((state) => state.setSelectedAccounts);
  const { data: accounts } = useTikTokAccounts();
  const [sortOrder, setSortOrder] = useState("most_views");

  const {
    data: posts,
    isLoading,
    refetch,
  } = usePosts({
    status: "PUBLISHED",
    accountId: selectedAccounts.map((a) => a.id),
  });

  const aggregatedStats = useMemo(() => {
    if (!posts) return { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 };
    return posts.reduce(
      (acc, post) => {
        acc.totalViews += post.view_count || 0;
        acc.totalLikes += post.like_count || 0;
        acc.totalComments += post.comment_count || 0;
        acc.totalShares += post.share_count || 0;
        return acc;
      },
      { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
    );
  }, [posts]);

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort((a, b) => {
      switch (sortOrder) {
        case "most_views":
          return (b.view_count || 0) - (a.view_count || 0);
        case "most_likes":
          return (b.like_count || 0) - (a.like_count || 0);
        case "most_recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "most_comments":
          return (b.comment_count || 0) - (a.comment_count || 0);
        case "most_shares":
          return (b.share_count || 0) - (a.share_count || 0);
        default:
          return 0;
      }
    });
  }, [posts, sortOrder]);

  useEffect(() => {
    if (accounts && selectedAccounts.length === 0) {
      setSelectedAccounts(accounts);
    }
  }, [accounts, setSelectedAccounts, selectedAccounts.length]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">TikTok Analytics</h1>
      <AccountSelector selectedAccounts={selectedAccounts} onSelectionChange={setSelectedAccounts} />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {posts && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{aggregatedStats.totalViews.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Likes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{aggregatedStats.totalLikes.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{aggregatedStats.totalComments.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Shares</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{aggregatedStats.totalShares.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
          <div>
            <div className="flex justify-end items-center mb-4 space-x-2">
              <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
                <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most_views">Most Views</SelectItem>
                  <SelectItem value="most_likes">Most Likes</SelectItem>
                  <SelectItem value="most_recent">Most Recent</SelectItem>
                  <SelectItem value="most_comments">Most Comments</SelectItem>
                  <SelectItem value="most_shares">Most Shares</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TikTokAnalyticsPage;
