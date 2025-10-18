import { useQueryClient } from "@tanstack/react-query";
import { useSyncTikTokAccountStats } from "./useSyncTikTokAccountStats";
import { useSyncTikTokAccountProfile } from "./useSyncTikTokAccountProfile";
import { useTikTokAccounts } from "./useTikTokAccounts";
import { queries } from "@/lib/queries";

export const useRefreshAllAccounts = () => {
  const { data: accounts } = useTikTokAccounts();
  const { mutate: syncStats, isPending: isSyncingStats } = useSyncTikTokAccountStats();
  const { mutate: syncProfile, isPending: isSyncingProfile } = useSyncTikTokAccountProfile();
  const queryClient = useQueryClient();

  const refreshAll = () => {
    if (accounts) {
      accounts.forEach((account) => {
        syncStats(account.id);
        syncProfile(account.id);
      });
      queryClient.invalidateQueries({
        queryKey: queries.tiktokAccountAnalytics.all._def,
      });
    }
  };

  return {
    refreshAll,
    isRefreshing: isSyncingStats || isSyncingProfile,
  };
};
