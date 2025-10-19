import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const fetchWithRetry = async (url: string, options: any, refreshToken?: string, authorization?: string) => {
  let response = await fetch(url, options);

  if (response.status === 401 && refreshToken) {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Access token expired, attempting refresh...");

    const headers: { [key: string]: string } = {
      "Content-Type": "application/json",
    };

    if (authorization) {
      if (authorization.startsWith("Bearer ")) {
        headers["Authorization"] = authorization;
      } else {
        headers["X-Internal-Secret"] = authorization;
      }
    }

    const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tiktok-refresh-token`;
    const refreshResponse = await fetch(functionUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error(`Error refreshing token: ${refreshResponse.status} ${refreshResponse.statusText}`, errorText);
      throw new Error("Failed to refresh token.");
    }

    const refreshedTokenData = await refreshResponse.json();

    const newOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${refreshedTokenData.access_token}`,
      },
    };
    response = await fetch(url, newOptions);
  }

  return response;
};
