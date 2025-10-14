import { useQuery } from "@tanstack/react-query";
import { supabase as jarvisClient } from "../../../lib/supabase/jarvisClient";
import { TikTokAccount } from "../types";
import { queries } from "../../../lib/queries";

export const fetchTikTokVideos = async (account: TikTokAccount) => {
  if (account.token_status !== "active") {
    return [];
  }

  const { data, error } = await jarvisClient.functions.invoke("tiktok-video-list", {
    body: {
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    },
  });

  if (error) {
    throw new Error(`Failed to fetch TikTok videos: ${error.message}`);
  }

  return data.data.videos;
};

export const useTikTokVideos = (account: TikTokAccount) => {
  return useQuery({
    ...queries.tiktokVideos.all([account.id]),
    queryFn: () => fetchTikTokVideos(account),
    enabled: !!account,
  });
};
