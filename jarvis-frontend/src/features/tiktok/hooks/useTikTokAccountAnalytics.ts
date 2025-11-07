import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";
import { Database } from "@/lib/supabase/database";

type LatestAccountAnalytics = Database["public"]["Functions"]["get_latest_account_analytics"]["Returns"][0];

const fetchTikTokAccountAnalytics = async (accountId: string | undefined): Promise<LatestAccountAnalytics | null> => {
  if (!accountId) return null;

  const { data, error } = await supabase.rpc<"get_latest_account_analytics">("get_latest_account_analytics");

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const accountAnalytics = (data as LatestAccountAnalytics[]).find((d) => d.account_id === accountId);
  return accountAnalytics || null;
};

export const useTikTokAccountAnalytics = (accountId: string | undefined) => {
  return useQuery({
    ...queries.tiktokAccountAnalytics.detail(accountId),
    queryFn: () => fetchTikTokAccountAnalytics(accountId),
    enabled: !!accountId,
  });
};
