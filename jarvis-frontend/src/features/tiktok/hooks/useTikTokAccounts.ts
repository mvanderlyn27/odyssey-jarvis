import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { queries } from "../../../lib/queries";
import { fetchTikTokAccounts } from "../api";

export const useTikTokAccounts = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;

  return useQuery({
    ...queries.tiktokAccounts.all(),
    queryFn: () => fetchTikTokAccounts(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
