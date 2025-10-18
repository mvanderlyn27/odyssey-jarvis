/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/tiktok-fetch.ts";

serve(async (_req: Request) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: posts, error } = await supabaseAdmin
      .from("posts")
      .select("*, tiktok_accounts(*), post_assets(*)")
      .eq("status", "SCHEDULED")
      .lte("scheduled_at", new Date().toISOString());

    if (error) throw error;

    for (const post of posts) {
      const { tiktok_accounts: account, post_assets: assets } = post;

      if (!account) {
        console.error(`Account not found for post ${post.id}`);
        continue;
      }

      const mediaUrls = {
        video_url: assets.find((a) => a.asset_type === "videos")?.asset_url,
        image_urls: assets
          .filter((a) => a.asset_type === "slides")
          .sort((a, b) => a.order - b.order)
          .map((a) => a.asset_url),
      };

      const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tiktok-content-post-init`;
      const options = {
        method: "POST",
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.access_token}`,
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

      await fetchWithRetry(url, options, account.refresh_token, `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`);
    }

    return new Response(JSON.stringify({ message: `Published ${posts.length} posts.` }), {
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
