import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const TIKTOK_API_URL = "https://open.tiktokapis.com/v2/post/publish/content/init/";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accessToken, mediaUrls, accountId, title, description } = await req.json();

    if (!accessToken || !mediaUrls || !accountId) {
      return new Response(JSON.stringify({ error: "Missing required parameters." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const body = {
      post_info: {
        title: title,
        description: description,
        privacy_level: "SELF_ONLY",
      },
      source_info: {
        source: "FILE_UPLOAD",
        photo_cover_index: 1,
        video_url: mediaUrls.video_url,
        photo_images: mediaUrls.image_urls,
      },
    };

    const response = await fetch(TIKTOK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("TikTok API Error:", errorData);
      throw new Error(`TikTok API request failed: ${errorData.error.message}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data.data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
