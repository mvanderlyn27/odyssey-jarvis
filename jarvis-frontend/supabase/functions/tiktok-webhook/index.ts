/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.3.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received webhook payload:", payload);

    const { event, content } = payload;
    let publish_id, reason;

    if (content) {
      const contentPayload = JSON.parse(content);
      publish_id = contentPayload.publish_id;
      reason = contentPayload.reason;
    } else {
      publish_id = payload.publish_id || payload.inbox_video_id;
    }

    if (!publish_id) {
      console.warn("Webhook received without a publish_id.");
      return new Response("ok", { headers: corsHeaders });
    }

    const updatePayload: { status: string; post_url?: string; reason?: string } = { status: "unknown" };

    if (event === "post.publish.complete") {
      updatePayload.status = "PUBLISHED";
      updatePayload.post_url = payload.share_url;
    } else if (event === "post.publish.failed") {
      updatePayload.status = "FAILED";
      updatePayload.reason = reason;
    } else if (event === "post.publish.inbox_delivered") {
      updatePayload.status = "INBOX";
    }

    if (updatePayload.status !== "unknown") {
      const { error } = await supabase.from("posts").update(updatePayload).eq("tiktok_publish_id", publish_id);

      if (error) {
        console.error("Failed to update post status:", error);
        return new Response(JSON.stringify({ error: "Failed to update post status" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
