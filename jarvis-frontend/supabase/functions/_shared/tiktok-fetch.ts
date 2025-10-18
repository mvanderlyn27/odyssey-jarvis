import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const fetchWithRetry = async (url: string, options: any, refreshToken?: string, authorization?: string) => {
  let response = await fetch(url, options);

  if (response.status === 401 && refreshToken) {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Access token expired, attempting refresh...");

    const headers: { [key: string]: string } = {};
    if (authorization) {
      headers["Authorization"] = authorization;
    }
    const internalSecret = Deno.env.get("INTERNAL_SECRET_KEY");
    if (options.headers["X-Internal-Secret"] && internalSecret) {
      headers["X-Internal-Secret"] = internalSecret;
    }

    const { data: refreshedTokenData, error: refreshError } = await supabaseAdmin.functions.invoke(
      "tiktok-refresh-token",
      {
        body: { refresh_token: refreshToken },
        headers,
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
