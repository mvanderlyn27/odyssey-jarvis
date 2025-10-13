// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { access_token } = await req.json();
    if (!access_token) {
      throw new Error("Access token is required.");
    }

    // Fetch user info from TikTok API
    const userResponse = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      throw new Error(`TikTok User API error: ${errorData.error.message}`);
    }

    const userData = await userResponse.json();

    return new Response(JSON.stringify(userData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
