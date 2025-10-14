// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fetchWithRetry } from "../_shared/tiktok-fetch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { access_token, refresh_token } = await req.json();
    console.log("Received request for user stats with access_token:", access_token);

    if (!access_token) {
      console.error("Missing access_token in request.");
      throw new Error("Access token is required.");
    }
    if (!refresh_token) {
      console.error("Missing refresh_token in request.");
      throw new Error("Refresh token is required.");
    }

    // Fetch user info from TikTok API
    console.log("Fetching user info from TikTok API...");
    const userResponse = await fetchWithRetry(
      `https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
      refresh_token,
      req.headers.get("Authorization")!
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error("Full TikTok User API Error Response:", JSON.stringify(errorData, null, 2));
      throw new Error(`TikTok User API error: ${errorData.error.message}`);
    }

    const userData = await userResponse.json();
    console.log("Successfully fetched user data from TikTok API.");

    return new Response(JSON.stringify(userData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("An error occurred in the tiktok-user-stats function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
