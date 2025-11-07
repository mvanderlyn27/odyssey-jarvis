/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/tiktok-fetch.ts";

interface PostAsset {
  asset_type: "videos" | "slides";
  asset_url: string;
  order: number;
}

serve(async (_req: Request) => {
  console.log("publish-scheduled-posts function invoked.");
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const currentTime = new Date().toISOString();
    console.log(`Fetching scheduled posts with scheduled_at <= ${currentTime}`);

    const { data: posts, error } = await supabaseAdmin
      .from("posts")
      .select("*, tiktok_accounts(*), post_assets(*)")
      .eq("status", "SCHEDULED")
      .lte("scheduled_at", currentTime);

    if (error) {
      console.error("Error fetching scheduled posts:", error);
      throw error;
    }

    if (!posts || posts.length === 0) {
      console.log("No posts to publish at this time.");
      return new Response(JSON.stringify({ message: "No posts to publish." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Found ${posts.length} posts to publish.`);

    for (const post of posts) {
      console.log(`Processing post ${post.id}`);
      const { tiktok_accounts: account, post_assets: assets } = post;

      if (!account) {
        console.error(`Account not found for post ${post.id}, skipping.`);
        continue;
      }

      const mediaUrlBase = Deno.env.get("MEDIA_URL") ?? "https://media.odysseyfit.app";

      const mediaUrls = {
        video_url: assets.find((a) => a.asset_type === "videos")?.asset_url
          ? `${mediaUrlBase}/${assets.find((a) => a.asset_type === "videos")?.asset_url}`
          : undefined,
        image_urls: assets
          .filter((a) => a.asset_type === "slides" && a.asset_url)
          .sort((a, b) => a.order - b.order)
          .map((a) => `${mediaUrlBase}/${a.asset_url}`),
      };

      const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tiktok-content-post-init`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": Deno.env.get("INTERNAL_SECRET_KEY"),
        },
        body: JSON.stringify({
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accountId: account.id,
          mediaUrls,
          title: post.title,
          description: post.description,
          postId: post.id,
        }),
      };

      try {
        await fetchWithRetry(url, options, account.refresh_token, Deno.env.get("INTERNAL_SECRET_KEY"));
        console.log(`Successfully initiated content post for post ${post.id}`);
      } catch (e: any) {
        console.error(`Failed to initiate content post for post ${post.id}:`, e);
        await supabaseAdmin.from("posts").update({ status: "FAILED", reason: e.message }).eq("id", post.id);
      }
    }

    return new Response(JSON.stringify({ message: `Published ${posts.length} posts.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("An error occurred in publish-scheduled-posts:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
