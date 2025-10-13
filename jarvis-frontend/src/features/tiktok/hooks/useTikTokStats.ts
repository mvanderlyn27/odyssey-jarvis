import { useEffect } from "react";
import { useTikTokStatsStore } from "../../../store/useTikTokStatsStore";
import { TikTokAccount } from "../types";

export const useTikTokStats = (account: TikTokAccount | null) => {
  const { stats, fetchStats } = useTikTokStatsStore();

  useEffect(() => {
    if (account?.access_token && account?.tiktok_open_id) {
      fetchStats(account.access_token, account.tiktok_open_id);
    }
  }, [account, fetchStats]);

  return account ? stats[account.tiktok_open_id] : null;
};
