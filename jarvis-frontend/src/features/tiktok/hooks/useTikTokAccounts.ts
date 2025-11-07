import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/useSession";
import { queries } from "../../../lib/queries";
import { fetchTikTokAccounts } from "../api";

export const useTikTokAccounts = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    ...queries.tiktokAccounts.all(),
    queryFn: () => fetchTikTokAccounts(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
