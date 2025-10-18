import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const fetchWithRetry = async (url: string, options: any, refreshToken: string, authorization: string) => {
  let response = await fetch(url, options);

  if (response.status === 401) {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Access token expired, attempting refresh...");
    console.log("Using refresh token:", refreshToken);
    console.log("Using authorization:", authorization);

    const { data: refreshedTokenData, error: refreshError } = await supabaseAdmin.functions.invoke(
      "tiktok-refresh-token",
      {
        body: { refresh_token: refreshToken },
        headers: { Authorization: authorization },
      }
    );

    if (refreshError) {
      console.error("Error invoking tiktok-refresh-token function:", refreshError);
      throw new Error("Failed to refresh token.");
    }

    options.headers.Authorization = `Bearer ${refreshedTokenData.access_token}`;
    response = await fetch(url, options);
  }

  return response;
};
