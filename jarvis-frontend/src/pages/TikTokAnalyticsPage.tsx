import { useEffect, useMemo, useState } from "react";
import AccountSelector from "../components/tiktok/AccountSelector";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { useQueries } from "@tanstack/react-query";
import { queries } from "../lib/queries";
import { fetchTikTokVideos } from "../features/tiktok/hooks/useTikTokVideos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TikTokVideoCard } from "@/components/tiktok/TikTokVideoCard";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

const TikTokAnalyticsPage = () => {
  const selectedAccountIds = useAnalyticsStore((state) => state.selectedAccountIds);
  const setSelectedAccountIds = useAnalyticsStore((state) => state.setSelectedAccountIds);
  const { data: accounts } = useTikTokAccounts();
  const [sortOrder, setSortOrder] = useState("most_views");

  const selectedAccounts = useMemo(
    () => accounts?.filter((acc) => selectedAccountIds.includes(acc.id)) || [],
    [accounts, selectedAccountIds]
  );

  const videoQueries = useQueries({
    queries: selectedAccounts.map((account) => ({
      ...queries.tiktokVideos.all([account.id]),
      queryFn: () => fetchTikTokVideos(account),
      enabled: !!account,
    })),
  });

  const videos = useMemo(() => videoQueries.flatMap((query) => query.data || []), [videoQueries]);
  const isLoading = useMemo(() => videoQueries.some((query) => query.isLoading), [videoQueries]);
  const refetch = () => videoQueries.forEach((query) => query.refetch());

  const aggregatedStats = useMemo(() => {
    if (!videos) return { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 };
    return videos.reduce(
      (acc: { totalViews: number; totalLikes: number; totalComments: number; totalShares: number }, video: any) => {
        acc.totalViews += video.view_count || 0;
        acc.totalLikes += video.like_count || 0;
        acc.totalComments += video.comment_count || 0;
        acc.totalShares += video.share_count || 0;
        return acc;
      },
      { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
    );
  }, [videos]);

  const sortedVideos = useMemo(() => {
    if (!videos) return [];
    return [...videos].sort((a: any, b: any) => {
      switch (sortOrder) {
        case "most_views":
          return b.view_count - a.view_count;
        case "most_likes":
          return b.like_count - a.like_count;
        case "most_recent":
          return b.create_time - a.create_time;
        case "most_comments":
          return b.comment_count - a.comment_count;
        case "most_shares":
          return b.share_count - a.share_count;
        default:
          return 0;
      }
    });
  }, [videos, sortOrder]);

  useEffect(() => {
    if (accounts) {
      setSelectedAccountIds(accounts.map((acc) => acc.id));
    }
  }, [accounts, setSelectedAccountIds]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">TikTok Analytics</h1>
      <AccountSelector selectedAccounts={selectedAccountIds} onSelectionChange={setSelectedAccountIds} />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {videos && (
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
              {sortedVideos.map((video) => (
                <TikTokVideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TikTokAnalyticsPage;
