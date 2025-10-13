// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { access_token, cursor, max_count } = await req.json();
    if (!access_token) {
      throw new Error("Access token is required.");
    }

    const params = new URLSearchParams({
      fields: "id,title,video_description,duration,cover_image_url,embed_link",
    });

    if (cursor) {
      params.append("cursor", String(cursor));
    }
    if (max_count) {
      params.append("max_count", String(max_count));
    }

    // Fetch video list from TikTok API
    const videoResponse = await fetch(`https://open.tiktokapis.com/v2/video/list/?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!videoResponse.ok) {
      const errorData = await videoResponse.json();
      throw new Error(`TikTok Video API error: ${errorData.error.message}`);
    }

    const videoData = await videoResponse.json();

    return new Response(JSON.stringify(videoData), {
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
