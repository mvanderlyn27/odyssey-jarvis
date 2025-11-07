import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";

type Granularity = "hourly" | "daily" | "weekly" | "monthly";

interface AnalyticsHistoryParams {
  accountId: string | undefined;
  granularity: Granularity;
  startDate: Date;
  endDate: Date;
}

const fetchTikTokAccountAnalyticsHistory = async ({
  accountId,
  granularity,
  startDate,
  endDate,
}: AnalyticsHistoryParams) => {
  if (!accountId) return null;

  const { data, error } = await supabase.rpc("get_account_analytics_history", {
    p_account_id: accountId,
    p_granularity: granularity,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useTikTokAccountAnalyticsHistory = ({
  accountId,
  granularity,
  startDate,
  endDate,
}: AnalyticsHistoryParams) => {
  return useQuery({
    ...queries.tiktokAccountAnalytics.history(accountId, granularity, startDate, endDate),
    queryFn: () => fetchTikTokAccountAnalyticsHistory({ accountId, granularity, startDate, endDate }),
    enabled: !!accountId,
  });
};
