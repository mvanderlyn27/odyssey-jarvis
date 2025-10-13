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

    // --- Start Pagination Logic ---
    let allVideos: any[] = [];
    let hasMore = true;
    let nextCursor: string | undefined = cursor;

    do {
      const body = {
        max_count: max_count || 20,
        ...(nextCursor && { cursor: nextCursor }),
      };

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

      const pageData = await videoResponse.json();

      if (pageData.error && pageData.error.code !== "ok") {
        throw new Error(`TikTok API returned an error: ${pageData.error.message}`);
      }

      if (pageData.data.videos) {
        allVideos = [...allVideos, ...pageData.data.videos];
      }

      hasMore = pageData.data.has_more;
      nextCursor = pageData.data.cursor;
    } while (hasMore);
    // --- End Pagination Logic ---

    // The original function returned the raw API response, which included a `data` object.
    // We now return an object that mimics that structure but contains ALL videos.
    const responsePayload = {
      data: {
        videos: allVideos,
        has_more: false, // We've fetched everything
        cursor: nextCursor,
      },
      error: {
        code: "ok",
        message: "",
        log_id: "",
      },
    };

    return new Response(JSON.stringify(responsePayload), {
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
