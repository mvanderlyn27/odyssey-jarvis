/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.3.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function invokeRefreshFunction(id: number) {
  // Expecting the internal primary key `id`
  const refreshUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tiktok-refresh-post-details`;
  const internalSecret = Deno.env.get("INTERNAL_SECRET");

  if (!internalSecret) {
    console.error("INTERNAL_SECRET is not set. Cannot invoke refresh function.");
    return;
  }

  try {
    // We don't await this, as we want the webhook to return quickly.
    fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalSecret,
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => {
        if (!response.ok) {
          response.text().then((errorBody) => {
            console.error(`Failed to invoke refresh function for post id ${id}:`, errorBody);
          });
        } else {
          console.log(`Successfully invoked refresh function for post id ${id}.`);
        }
      })
      .catch((error) => {
        console.error(`Error invoking refresh function for post id ${id}:`, error);
      });
  } catch (error) {
    console.error(`Error preparing fetch for refresh function, post id ${id}:`, error);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received webhook payload:", payload);

    const { event, content } = payload;
    let publish_id: string | undefined;
    let post_id: string | undefined;
    let reason: string | undefined;

    if (content) {
      const contentPayload = JSON.parse(content);
      publish_id = contentPayload.publish_id;
      post_id = contentPayload.post_id;
      reason = contentPayload.reason;
    } else {
      publish_id = payload.publish_id || payload.inbox_video_id;
    }

    if (!publish_id) {
      console.warn("Webhook received without a publish_id.");
      return new Response("ok", { headers: corsHeaders });
    }

    switch (event) {
      case "post.publish.publicly_available":
        if (post_id) {
          const statusUpdate = {
            status: "PUBLISHED",
            post_id: post_id,
            published_at: new Date().toISOString(),
          };
          // Update the post and get its internal ID back.
          const { data: updatedPosts, error } = await supabase
            .from("posts")
            .update(statusUpdate)
            .eq("tiktok_publish_id", publish_id)
            .select("id");

          if (error) {
            console.error(`Failed to update post status for publish_id ${publish_id}:`, error);
          } else if (updatedPosts && updatedPosts.length > 0) {
            const internal_id = updatedPosts[0].id;
            // Now, invoke the refresh function with the stable internal ID.
            invokeRefreshFunction(internal_id);
          } else {
            console.warn(`No post found for publish_id ${publish_id} to update.`);
          }
        } else {
          console.warn("`publicly_available` event missing post_id.");
        }
        break;
      case "post.publish.complete":
        await supabase
          .from("posts")
          .update({ status: "PUBLISHED", published_at: new Date().toISOString() })
          .eq("tiktok_publish_id", publish_id);
        break;
      case "post.publish.failed":
        await supabase.from("posts").update({ status: "FAILED", reason: reason }).eq("tiktok_publish_id", publish_id);
        break;
      case "post.publish.inbox_delivered":
        await supabase.from("posts").update({ status: "INBOX" }).eq("tiktok_publish_id", publish_id);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event}`);
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
