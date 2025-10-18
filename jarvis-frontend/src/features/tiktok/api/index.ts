import { supabase } from "../../../lib/supabase/jarvisClient";
import { TikTokAccount } from "../types";

export const fetchTikTokAccounts = async (): Promise<TikTokAccount[] | null> => {
  const { data: accounts, error } = await supabase.from("tiktok_accounts").select("*");

  if (error) throw new Error(error.message);
  return accounts;
};

export const refreshTikTokAccountStats = async (account: TikTokAccount) => {
  const { error } = await supabase.functions.invoke("tiktok-user-stats", {
    body: {
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      open_id: account.tiktok_open_id,
    },
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

export const fetchAllTikTokAccountAnalytics = async () => {
  const { data, error } = await supabase.rpc("get_latest_account_analytics");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const syncTikTokVideos = async (accountId: string) => {
  const { error } = await supabase.functions.invoke("sync-tiktok-videos", {
    body: { account_id: accountId },
  });

  if (error) {
    throw new Error(`Failed to sync TikTok videos: ${error.message}`);
  }
};

export const initiateTikTokPost = async (
  accessToken: string,
  refreshToken: string,
  accountId: string,
  mediaUrls: { video_url?: string; image_urls?: string[] },
  title: string,
  description: string,
  postId: string
) => {
  const { data, error } = await supabase.functions.invoke("tiktok-content-post-init", {
    body: { accessToken, refreshToken, mediaUrls, accountId, title, description, postId },
  });

  if (error) {
    throw new Error(`Failed to initiate TikTok post: ${error.message}`);
  }

  return data;
};

export const fetchTikTokPosts = async (account: TikTokAccount) => {
  if (account.token_status !== "active") {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*, post_analytics(*), post_assets(*)")
    .eq("tiktok_account_id", account.id);

  if (error) {
    throw new Error(`Failed to fetch TikTok posts: ${error.message}`);
  }

  return data;
};
