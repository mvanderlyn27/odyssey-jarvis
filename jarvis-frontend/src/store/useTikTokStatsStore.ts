import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase as jarvisClient } from "../lib/supabase/jarvisClient";

interface TikTokStats {
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

interface TikTokStatsState {
  stats: Record<string, TikTokStats & { lastFetched: number | null }>;
  loading: boolean;
  fetchStats: (accessToken: string, openId: string) => Promise<void>;
}

export const useTikTokStatsStore = create<TikTokStatsState>()(
  persist(
    (set, get) => ({
      stats: {},
      loading: false,
      fetchStats: async (accessToken, openId) => {
        const now = Date.now();
        const accountStats = get().stats[openId];

        if (accountStats?.lastFetched && now - accountStats.lastFetched < 1000 * 60 * 5) {
          // 5-minute cache
          return;
        }

        set({ loading: true });

        try {
          const { data, error } = await jarvisClient.functions.invoke("tiktok-user-stats", {
            body: { access_token: accessToken },
          });

          if (error) {
            const responseBody = await error.context.json();
            throw new Error(`Function error: ${responseBody.error || error.message}`);
          }
          const newStats = data.data.user;

          set((state) => ({
            stats: {
              ...state.stats,
              [openId]: {
                ...newStats,
                lastFetched: now,
              },
            },
            loading: false,
          }));
        } catch (error) {
          console.error("Failed to fetch TikTok stats:", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "tiktok-stats-storage",
    }
  )
);
