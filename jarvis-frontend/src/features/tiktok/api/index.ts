import { supabase } from "../../../lib/supabase/jarvisClient";
import { TikTokAccount } from "../types";

const STATS_STALE_THRESHOLD = 1000 * 60 * 60; // 1 hour

export const fetchTikTokAccounts = async (userId: string | undefined): Promise<TikTokAccount[] | null> => {
  if (!userId) return null;

  const { data: accounts, error } = await supabase.from("tiktok_accounts").select("*").eq("user_id", userId);

  if (error) throw new Error(error.message);
  if (!accounts) return [];

  const accountsWithStats = await Promise.all(
    accounts.map(async (account) => {
      const statsUpdatedAt = account.stats_updated_at ? new Date(account.stats_updated_at).getTime() : 0;
      const isStale = Date.now() - statsUpdatedAt > STATS_STALE_THRESHOLD;

      if (isStale && account.token_status === "active") {
        // Non-blocking call to refresh stats in the background
        supabase.functions
          .invoke("tiktok-user-stats", {
            body: { access_token: account.access_token, open_id: account.tiktok_open_id },
          })
          .then(({ error: refreshError }) => {
            if (refreshError) {
              console.error(`Background refresh failed for ${account.tiktok_username}:`, refreshError);
            }
          });
      }

      return {
        ...account,
        is_stale: isStale,
      };
    })
  );

  return accountsWithStats;
};

export const refreshTikTokAccountStats = async (account: TikTokAccount) => {
  const { error } = await supabase.functions.invoke("tiktok-user-stats", {
    body: { access_token: account.access_token, open_id: account.tiktok_open_id },
  });

  if (error) {
    throw new Error(`Failed to refresh stats for ${account.tiktok_username}: ${error.message}`);
  }
};
