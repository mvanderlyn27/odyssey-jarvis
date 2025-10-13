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
    // Clone the request to read the body, as it can only be read once.
    const reqClone = req.clone();
    const rawBody = await reqClone.text();
    console.log("tiktok-video-list received raw body:", rawBody);

    const { access_token, cursor, max_count } = await req.json();
    if (!access_token) {
      console.error("'access_token' not found in parsed body.");
      throw new Error("Access token is required.");
    }

    const fields =
      "id,title,video_description,duration,cover_image_url,embed_link,view_count,like_count,comment_count,share_count,create_time";
    const url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`;

    const body = {
      max_count: max_count || 20,
      ...(cursor && { cursor }),
    };

    // Fetch video list from TikTok API
    const videoResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    console.error("Error in tiktok-video-list function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
