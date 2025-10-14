import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);

export const fetchWithRetry = async (url: string, options: any, refreshToken: string, authorization: string) => {
  let response = await fetch(url, options);

  if (response.status === 401) {
    console.log("Access token expired, attempting refresh...");
    const { data: refreshedTokenData, error: refreshError } = await supabase.functions.invoke("tiktok-refresh-token", {
      body: { refresh_token: refreshToken },
      headers: { Authorization: authorization },
    });

    if (refreshError) {
      throw new Error("Failed to refresh token.");
    }

    options.headers.Authorization = `Bearer ${refreshedTokenData.access_token}`;
    response = await fetch(url, options);
  }

  return response;
};
