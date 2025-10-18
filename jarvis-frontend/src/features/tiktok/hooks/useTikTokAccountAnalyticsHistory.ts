import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";

import { subDays } from "date-fns";

const fetchTikTokAccountAnalyticsHistory = async (accountId: string | undefined) => {
  if (!accountId) return null;

  const twoDaysAgo = subDays(new Date(), 2).toISOString();

  const { data, error } = await supabase
    .from("account_analytics")
    .select("*")
    .eq("tiktok_account_id", accountId)
    .gte("created_at", twoDaysAgo)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useTikTokAccountAnalyticsHistory = (accountId: string | undefined) => {
  return useQuery({
    ...queries.tiktokAccountAnalytics.history(accountId),
    queryFn: () => fetchTikTokAccountAnalyticsHistory(accountId),
    enabled: !!accountId,
  });
};
