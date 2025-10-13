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
    const { access_token, video_ids } = await req.json();
    if (!access_token) {
      throw new Error("Access token is required.");
    }
    if (!video_ids || !Array.isArray(video_ids) || video_ids.length === 0) {
      throw new Error("Video IDs are required and must be a non-empty array.");
    }

    // Fetch video details from TikTok API
    const videoResponse = await fetch(
      `https://open.tiktokapis.com/v2/video/query/?fields=id,title,video_description,duration,cover_image_url,embed_link,view_count,like_count,comment_count,share_count`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: {
            video_ids: video_ids,
          },
        }),
      }
    );

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
