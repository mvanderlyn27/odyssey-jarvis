import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TikTokStats {
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

interface TikTokStatsState {
  stats: Record<string, TikTokStats & { lastFetched: number | null }>;
  fetchStats: (accessToken: string, openId: string) => Promise<void>;
}

export const useTikTokStatsStore = create<TikTokStatsState>()(
  persist(
    (set, get) => ({
      stats: {},
      fetchStats: async (accessToken, openId) => {
        const now = Date.now();
        const accountStats = get().stats[openId];

        if (accountStats?.lastFetched && now - accountStats.lastFetched < 1000 * 60 * 5) {
          // 5-minute cache
          return;
        }

        try {
          const response = await fetch(import.meta.env.VITE_TIKTOK_PROXY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`TikTok Proxy API error: ${errorData.error.message}`);
          }

          const data = await response.json();
          const newStats = data.data.user;

          set((state) => ({
            stats: {
              ...state.stats,
              [openId]: {
                ...newStats,
                lastFetched: now,
              },
            },
          }));
        } catch (error) {
          console.error("Failed to fetch TikTok stats:", error);
        }
      },
    }),
    {
      name: "tiktok-stats-storage",
    }
  )
);
