import { useQuery } from "@tanstack/react-query";
import { fetchTikTokVideosAndAggregate } from "../api";
import { useAnalyticsStore } from "../../../store/useAnalyticsStore";
import { queries } from "../../../lib/queries";
import { useTikTokAccounts } from "./useTikTokAccounts";

export const useTikTokAggregatedStats = () => {
  const selectedAccountIds = useAnalyticsStore((state) => state.selectedAccountIds);
  const { data: accounts } = useTikTokAccounts();

  const selectedAccessTokens = accounts
    ?.filter((acc) => selectedAccountIds.includes(acc.id))
    .map((acc) => acc.access_token);

  return useQuery({
    ...queries.tiktokAggregatedStats.all(selectedAccountIds),
    queryFn: () => fetchTikTokVideosAndAggregate(selectedAccessTokens || []),
    enabled: !!selectedAccessTokens && selectedAccessTokens.length > 0,
  });
};
