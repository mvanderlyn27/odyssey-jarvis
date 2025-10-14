/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.3.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/tiktok-fetch.ts";

const TIKTOK_STATUS_API_URL = "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { published_post_id } = await req.json();

    if (!published_post_id) {
      return new Response(JSON.stringify({ error: "Missing published_post_id." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: post, error: fetchError } = await supabaseAdmin
      .from("posts")
      .select("*, tiktok_accounts(*)")
      .eq("id", published_post_id)
      .single();

    if (fetchError || !post) {
      console.error("Error fetching published post:", fetchError);
      return new Response(JSON.stringify({ error: "Published post not found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (!post.tiktok_publish_id) {
      return new Response(JSON.stringify({ error: "Post does not have a publish_id yet." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const response = await fetchWithRetry(
      TIKTOK_STATUS_API_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${post.tiktok_accounts.access_token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ publish_id: post.tiktok_publish_id }),
      },
      post.tiktok_accounts.refresh_token,
      req.headers.get("Authorization")!
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("TikTok API Error:", errorData);
      throw new Error(`TikTok API request failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    const status = data.data.status;
    const failure_reason = data.data.fail_reason;

    const updatePayload: { status: string; reason?: string } = { status };
    if (failure_reason) {
      updatePayload.status = "FAILED";
      updatePayload.reason = failure_reason;
    }

    const { error: updateError } = await supabaseAdmin.from("posts").update(updatePayload).eq("id", published_post_id);

    if (updateError) {
      console.error("Error updating post status:", updateError);
      throw new Error("Could not update post status.");
    }

    if (status === "PUBLISH_FAILED" && post.id) {
      const { error: draftError } = await supabaseAdmin.from("posts").update({ status: "FAILED" }).eq("id", post.id);

      if (draftError) {
        console.error("Failed to update draft status to failed:", draftError);
      }
    }

    return new Response(JSON.stringify({ status: status, reason: failure_reason }), {
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
