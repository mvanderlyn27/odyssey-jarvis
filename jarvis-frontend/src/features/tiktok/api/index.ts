import { supabase } from "../../../lib/supabase/jarvisClient";
import { TikTokAccount } from "../types";

const STATS_STALE_THRESHOLD = 1000 * 60 * 60; // 1 hour

export const fetchTikTokAccounts = async (): Promise<TikTokAccount[] | null> => {
  const { data: accounts, error } = await supabase.from("tiktok_accounts").select("*");

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

export const removeTikTokAccount = async (accountId: string) => {
  const { error } = await supabase.from("tiktok_accounts").delete().eq("id", accountId);

  if (error) {
    throw new Error(`Failed to remove TikTok account: ${error.message}`);
  }
};

export const fetchTikTokVideosAndAggregate = async (accessTokens: string[]) => {
  const { data, error } = await supabase.functions.invoke("tiktok-fetch-videos-and-aggregate", {
    body: { accessTokens },
  });

  if (error) {
    throw new Error(`Failed to fetch videos and aggregate stats: ${error.message}`);
  }

  return data;
};

export const initiateTikTokPost = async (
  accessToken: string,
  accountId: string,
  mediaUrls: { video_url?: string; image_urls?: string[] },
  title: string,
  description: string,
  postId: string
) => {
  const { data, error } = await supabase.functions.invoke("tiktok-content-post-init", {
    body: { accessToken, mediaUrls, accountId, title, description, postId },
  });

  if (error) {
    throw new Error(`Failed to initiate TikTok post: ${error.message}`);
  }

  return data;
};
