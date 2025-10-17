import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";

const fetchDailyAccountAnalytics = async (accountIds: string[], startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from("account_analytics")
    .select("*")
    .in("tiktok_account_id", accountIds)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useDailyAccountAnalytics = (accountIds: string[], startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["dailyAccountAnalytics", accountIds, startDate, endDate],
    queryFn: () => fetchDailyAccountAnalytics(accountIds, startDate, endDate),
    enabled: !!accountIds && accountIds.length > 0 && !!startDate && !!endDate,
  });
};
