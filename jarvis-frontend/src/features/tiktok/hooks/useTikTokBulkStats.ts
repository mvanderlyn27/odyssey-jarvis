import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as jarvisClient } from "../../../lib/supabase/jarvisClient";
import { TikTokAccount } from "../types";
import { queries } from "../../../lib/queries";

const fetchTikTokBulkStats = async (accounts: TikTokAccount[]) => {
  const activeAccounts = accounts.filter((acc) => acc.token_status === "active");
  if (activeAccounts.length === 0) {
    return [];
  }

  const accountIds = activeAccounts.map((acc) => acc.id);

  const { data, error } = await jarvisClient.functions.invoke("tiktok-bulk-video-details", {
    body: { accountIds },
  });

  if (error) {
    throw new Error(`Failed to fetch bulk TikTok stats: ${error.message}`);
  }

  return data;
};

export const useTikTokBulkStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accounts: TikTokAccount[]) => fetchTikTokBulkStats(accounts),
    onSuccess: (data) => {
      const statsMap = new Map();
      data.forEach((stat: any) => {
        statsMap.set(stat.tiktok_account_id, stat);
      });

      const queryKey = queries.tiktokAccounts.all().queryKey;
      const previousAccounts = queryClient.getQueryData<TikTokAccount[]>(queryKey);

      if (previousAccounts) {
        const updatedAccounts = previousAccounts.map((acc) => {
          const stats = statsMap.get(acc.id);
          if (stats) {
            return {
              ...acc,
              follower_count: stats.follower_count,
              likes_count: stats.likes_count,
              video_count: stats.video_count,
            };
          }
          return acc;
        });
        queryClient.setQueryData(queryKey, updatedAccounts);
      }
    },
  });
};
