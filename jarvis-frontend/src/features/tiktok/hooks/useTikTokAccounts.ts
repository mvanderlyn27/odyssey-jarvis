import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { queries } from "../../../lib/queries";
import { fetchTikTokAccounts, refreshTikTokAccountStats } from "../api";
import { TikTokAccount } from "../types";

export const useTikTokAccounts = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;

  return useQuery({
    ...queries.tiktokAccounts.all(),
    queryFn: () => fetchTikTokAccounts(),
    enabled: !!userId,
  });
};

export const useRefreshTikTokStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (account: TikTokAccount) => refreshTikTokAccountStats(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.tiktokAccounts.all().queryKey });
    },
  });
};
