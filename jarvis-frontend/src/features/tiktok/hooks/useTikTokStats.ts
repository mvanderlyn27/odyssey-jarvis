import { useQuery } from "@tanstack/react-query";
import { supabase as jarvisClient } from "../../../lib/supabase/jarvisClient";
import { TikTokAccount } from "../types";

const fetchTikTokStats = async (accessToken: string) => {
  const { data, error } = await jarvisClient.functions.invoke("tiktok-user-stats", {
    body: { access_token: accessToken },
  });

  if (error) {
    const responseBody = await error.context.json();
    throw new Error(`Function error: ${responseBody.error || error.message}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.data.user as any;
};

export const useTikTokStats = (account: TikTokAccount | null) => {
  const accessToken = account?.access_token;
  const openId = account?.tiktok_open_id;

  return useQuery({
    queryKey: ["tiktok-stats", openId],
    queryFn: () => fetchTikTokStats(accessToken!),
    enabled: !!accessToken && !!openId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
