import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTikTokVideosStore } from "../store/useTikTokVideosStore";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { Skeleton } from "@/components/ui/skeleton";
import { TikTokVideoCard } from "@/components/tiktok/TikTokVideoCard";

const TikTokVideosPage = () => {
  const { openId } = useParams<{ openId: string }>();
  const { data: accounts } = useTikTokAccounts();
  const { videos, loading, error, fetchVideos } = useTikTokVideosStore();

  const account = accounts?.find((acc) => acc.tiktok_open_id === openId);
  const accountVideos = videos[openId ?? ""] ?? [];

  useEffect(() => {
    if (account?.access_token && openId) {
      fetchVideos(account.access_token, openId);
    }
  }, [account, openId, fetchVideos]);

  if (loading) {
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

  if (error) {
    return <p className="text-red-600 p-4">Error: {error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Videos for {account?.tiktok_display_name ?? "..."}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {accountVideos.map((video) => (
          <TikTokVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default TikTokVideosPage;
