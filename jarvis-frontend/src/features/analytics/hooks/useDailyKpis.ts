import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { fetchDailyKpis } from "@/features/analytics/api";

export const useDailyKpis = (accountIds: string[], dateRange: { from: string; to: string }) => {
  return useQuery({
    ...queries.analytics.dailyKpis(accountIds, dateRange),
    queryFn: () => fetchDailyKpis(accountIds, dateRange),
    enabled: accountIds.length > 0 && !!dateRange,
  });
};
