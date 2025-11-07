import { supabase } from "@/lib/supabase/jarvisClient";
import { fetchUserPlan, getAnalyticsTableName } from "./utils";

export const getPostAnalyticsHistory = async (postId: string) => {
  const plan = await fetchUserPlan();
  const tableName = getAnalyticsTableName("post_analytics", plan);

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchDailyKpis = async (accountIds: string[], dateRange: { from: string; to: string }) => {
  const { data, error } = await supabase.rpc("get_daily_kpis", {
    p_account_ids: accountIds,
    p_start_date: dateRange.from,
    p_end_date: dateRange.to,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
