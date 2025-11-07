import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";

const fetchDailyAccountAnalytics = async (
  accountId: string,
  granularity: "daily" | "hourly" | "weekly" | "monthly",
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase.rpc("get_account_analytics_history", {
    p_account_id: accountId,
    p_granularity: granularity,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useDailyAccountAnalytics = (
  accountId: string,
  granularity: "daily" | "hourly" | "weekly" | "monthly",
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ["dailyAccountAnalytics", accountId, granularity, startDate, endDate],
    queryFn: () => fetchDailyAccountAnalytics(accountId, granularity, startDate, endDate),
    enabled: !!accountId && !!startDate && !!endDate,
  });
};
