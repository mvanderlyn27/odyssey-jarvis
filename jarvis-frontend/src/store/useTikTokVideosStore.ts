import { create } from "zustand";
import { supabase as jarvisClient } from "../lib/supabase/jarvisClient";
import { TikTokVideo } from "../features/tiktok/types";

interface TikTokVideosState {
  videos: Record<string, TikTokVideo[]>;
  loading: boolean;
  error: string | null;
  fetchVideos: (accessToken: string, openId: string) => Promise<void>;
}

export const useTikTokVideosStore = create<TikTokVideosState>((set) => ({
  videos: {},
  loading: false,
  error: null,
  fetchVideos: async (accessToken, openId) => {
    set({ loading: true, error: null });
    try {
      // Step 1: Fetch all video IDs with pagination
      let allVideos: any[] = [];
      let cursor: string | null = null;
      let hasMore = true;

      while (hasMore) {
        const { data: videoListData, error: listError } = await jarvisClient.functions.invoke<{
          data: { videos: any[]; cursor: string; has_more: boolean };
        }>("tiktok-video-list", {
          body: { access_token: accessToken, cursor, max_count: 20 },
        });

        if (listError || !videoListData) throw new Error("Failed to fetch video list.");

        allVideos = allVideos.concat(videoListData.data.videos);
        cursor = videoListData.data.cursor;
        hasMore = videoListData.data.has_more;
      }

      const videoIds = allVideos.map((video) => video.id);

      // Step 2: Fetch details for all videos in a single batch
      if (videoIds.length > 0) {
        const { data: videoDetailsData, error: detailsError } = await jarvisClient.functions.invoke(
          "tiktok-video-details",
          {
            body: { access_token: accessToken, video_ids: videoIds },
          }
        );

        if (detailsError) throw new Error("Failed to fetch video details.");

        set((state) => ({
          videos: {
            ...state.videos,
            [openId]: videoDetailsData.data.videos,
          },
          loading: false,
        }));
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },
}));
