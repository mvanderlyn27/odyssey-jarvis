import { useQuery } from "@tanstack/react-query";
import { supabase as jarvisClient } from "../../../lib/supabase/jarvisClient";
import { TikTokAccount } from "../types";

const fetchTikTokBulkStats = async (accounts: TikTokAccount[]) => {
  const activeAccounts = accounts.filter((acc) => acc.token_status === "active");
  if (activeAccounts.length === 0) {
    return [];
  }

  const accessTokens = activeAccounts.map((acc) => ({
    access_token: acc.access_token,
    refresh_token: acc.refresh_token,
  }));

  const { data, error } = await jarvisClient.functions.invoke("tiktok-bulk-user-stats", {
    body: { accessTokens },
  });

  if (error) {
    throw new Error(`Failed to fetch bulk TikTok stats: ${error.message}`);
  }

  // The backend function returns an object with a 'stats' property, which is an array.
  // We need to map this back to the original accounts.
  const statsMap = new Map();
  data.stats.forEach((stat: any, index: number) => {
    if (stat && !stat.error && stat.user) {
      // The order of stats in the response matches the order of the access tokens sent.
      const account = activeAccounts[index];
      statsMap.set(account.id, stat.user);
    }
  });

  return accounts.map((acc) => {
    return {
      ...acc,
      ...statsMap.get(acc.id), // Merge the stats into the account object
    };
  });
};

export const useTikTokBulkStats = (accounts: TikTokAccount[]) => {
  return useQuery({
    queryKey: ["tiktokBulkStats", accounts.map((a) => a.id)],
    queryFn: () => fetchTikTokBulkStats(accounts),
    enabled: !!accounts && accounts.length > 0,
  });
};
