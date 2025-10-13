import { useQuery } from "@tanstack/react-query";
import { supabase as jarvisClient } from "../../../lib/supabase/jarvisClient";
import { TikTokVideo, TikTokVideoListResponse } from "../types";

const fetchTikTokVideos = async (accessToken: string): Promise<TikTokVideo[]> => {
  let allVideos: { id: string }[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const response: { data: TikTokVideoListResponse | null; error: Error | null } =
      await jarvisClient.functions.invoke<TikTokVideoListResponse>("tiktok-video-list", {
        body: { access_token: accessToken, cursor, max_count: 20 },
      });

    const { data: videoListData, error: listError } = response;

    if (listError) throw new Error("Failed to fetch video list." + listError.message);
    if (!videoListData) throw new Error("Missing video list data");

    allVideos = allVideos.concat(videoListData.data.videos);
    cursor = videoListData.data.cursor;
    hasMore = videoListData.data.has_more;
  }

  const videoIds = allVideos.map((video) => video.id);
  const videoDetails: TikTokVideo[] = [];

  if (videoIds.length > 0) {
    for (let i = 0; i < videoIds.length; i += 20) {
      const batch = videoIds.slice(i, i + 20);
      const { data: videoDetailsData, error: detailsError } = await jarvisClient.functions.invoke(
        "tiktok-video-details",
        {
          body: { access_token: accessToken, video_ids: batch },
        }
      );

      if (detailsError) throw new Error("Failed to fetch video details.");
      if (videoDetailsData?.data?.videos) {
        videoDetails.push(...videoDetailsData.data.videos);
      }
    }
  }

  return videoDetails;
};

export const useTikTokVideos = (accessToken: string, openId: string) => {
  return useQuery({
    queryKey: ["tiktokVideos", openId],
    queryFn: () => fetchTikTokVideos(accessToken),
    enabled: !!accessToken && !!openId,
  });
};
