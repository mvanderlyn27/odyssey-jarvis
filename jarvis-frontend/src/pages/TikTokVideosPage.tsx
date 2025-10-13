import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { useTikTokVideos } from "../features/tiktok/hooks/useTikTokVideos";
import { Skeleton } from "@/components/ui/skeleton";
import { TikTokVideoCard } from "@/components/tiktok/TikTokVideoCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TikTokVideo } from "@/features/tiktok/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortOrder = "recency" | "views" | "likes" | "comments" | "shares";

const TikTokVideosPage = () => {
  const { openId } = useParams<{ openId: string }>();
  const navigate = useNavigate();
  const { data: accounts } = useTikTokAccounts();
  const account = accounts?.find((acc) => acc.tiktok_open_id === openId);
  const {
    data: videos,
    isLoading,
    isError,
    error,
    refetch,
  } = useTikTokVideos(account?.access_token ?? "", openId ?? "");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recency");

  const sortedVideos = useMemo(() => {
    if (!videos) return [];
    const sorted = [...videos];
    switch (sortOrder) {
      case "views":
        return sorted.sort((a, b) => b.view_count - a.view_count);
      case "likes":
        return sorted.sort((a, b) => b.like_count - a.like_count);
      case "comments":
        return sorted.sort((a, b) => b.comment_count - a.comment_count);
      case "shares":
        return sorted.sort((a, b) => b.share_count - a.share_count);
      case "recency":
      default:
        return sorted.sort((a, b) => b.create_time - a.create_time);
    }
  }, [videos, sortOrder]);

  const kpis = useMemo(() => {
    if (!videos) {
      return { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 };
    }
    return videos.reduce(
      (acc, video) => {
        acc.totalViews += video.view_count || 0;
        acc.totalLikes += video.like_count || 0;
        acc.totalComments += video.comment_count || 0;
        acc.totalShares += video.share_count || 0;
        return acc;
      },
      { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
    );
  }, [videos]);

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

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate(-1)}>Back</Button>
        <h1 className="text-2xl font-bold text-center">Videos for {account?.tiktok_display_name ?? "..."}</h1>
        {/* Spacer */}
        <div />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.totalLikes.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.totalComments.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.totalShares.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-end items-center gap-4">
        <p>Total Videos: {videos?.length ?? 0}</p>
        <Button onClick={() => refetch()}>Refresh</Button>
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
        {sortedVideos.map((video: TikTokVideo) => (
          <TikTokVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default TikTokVideosPage;
