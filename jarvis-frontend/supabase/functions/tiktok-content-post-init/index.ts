/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.3.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

const TIKTOK_CONTENT_API_URL = "https://open.tiktokapis.com/v2/post/publish/content/init/";
const TIKTOK_INBOX_API_URL = "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accessToken, mediaUrls, accountId, title, description, postId } = await req.json();

    if (!accessToken || !mediaUrls || !accountId || !postId) {
      return new Response(JSON.stringify({ error: "Missing required parameters." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({
        status: "PROCESSING",
        tiktok_account_id: accountId,
      })
      .eq("id", postId);

    if (updateError) {
      console.error("Error updating post to processing:", updateError);
      throw new Error("Could not update post to processing.");
    }

    let source_info;
    if (mediaUrls.video_url) {
      source_info = {
        source: "PULL_FROM_URL",
        video_url: mediaUrls.video_url,
      };
    } else if (mediaUrls.image_urls && mediaUrls.image_urls.length > 0) {
      source_info = {
        source: "PULL_FROM_URL",
        photo_cover_index: 1,
        photo_images: mediaUrls.image_urls,
      };
    } else {
      return new Response(JSON.stringify({ error: "No valid media provided." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let TIKTOK_API_URL;
    const body: any = {};

    if (mediaUrls.video_url) {
      TIKTOK_API_URL = TIKTOK_INBOX_API_URL;
      body.source_info = source_info;
    } else if (mediaUrls.image_urls && mediaUrls.image_urls.length > 0) {
      TIKTOK_API_URL = TIKTOK_CONTENT_API_URL;
      body.post_info = {
        title: title,
        description: description,
        privacy_level: "SELF_ONLY",
      };
      body.source_info = source_info;
      body.post_mode = "MEDIA_UPLOAD";
      body.media_type = "PHOTO";
    } else {
      return new Response(JSON.stringify({ error: "No valid media provided." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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
    const publishId = data.data.publish_id;

    const { error: finalUpdateError } = await supabaseAdmin
      .from("posts")
      .update({ tiktok_publish_id: publishId })
      .eq("id", postId);

    if (finalUpdateError) {
      console.error("Error updating post with publish_id:", finalUpdateError);
      throw new Error("Could not update post with publish_id.");
    }

    return new Response(JSON.stringify({ publish_id: publishId }), {
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
