import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";

const fetchTikTokAccountAnalytics = async (accountId: string | undefined) => {
  if (!accountId) return null;

  const { data, error } = await supabase
    .from("account_analytics")
    .select("*")
    .eq("tiktok_account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // Ignore 'single row not found' errors
    throw new Error(error.message);
  }

  return data;
};

export const useTikTokAccountAnalytics = (accountId: string | undefined) => {
  return useQuery({
    ...queries.tiktokAccountAnalytics.detail(accountId),
    queryFn: () => fetchTikTokAccountAnalytics(accountId),
    enabled: !!accountId,
  });
};
