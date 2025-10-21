/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateRequest } from "../_shared/auth.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const { error: authError } = await authenticateRequest(req);
    if (authError) {
      throw authError;
    }

    const { id } = await req.json(); // Expecting the internal primary key `id`
    if (!id) {
      throw new Error("Post `id` is required.");
    }

    // 1. Find the post in our database to get the account ID and the TikTok post_id.
    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id, post_id, tiktok_account_id")
      .eq("id", id)
      .single();

    if (postError || !post) {
      throw new Error(`Failed to find post with id: ${id}`);
    }

    if (!post.post_id) {
      throw new Error(`Post ${id} does not have a TikTok post_id yet.`);
    }

    // 2. Get the account's access token.
    const { data: account, error: accountError } = await supabaseAdmin
      .from("tiktok_accounts")
      .select("access_token")
      .eq("id", post.tiktok_account_id)
      .single();

    if (accountError || !account) {
      throw new Error(`Failed to find account for post: ${post.id}`);
    }

    // 3. Fetch video details from TikTok.
    const url = new URL(`${TIKTOK_API_BASE}/video/query/`);
    url.searchParams.append(
      "fields",
      "id,share_url,video_description,duration,height,width,title,embed_link,like_count,comment_count,share_count,view_count"
    );

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters: { video_ids: [post.post_id] } }),
    };

    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Failed to fetch video details from TikTok:", errorBody);
      throw new Error("TikTok API request failed.");
    }

    const { data: videoData } = await response.json();
    const video = videoData?.videos?.[0];

    if (!video) {
      throw new Error(`TikTok API did not return video data for post_id: ${post.post_id}`);
    }

    // 4. Update our post with the new details.
    const postUpdate = {
      title: video.title,
      description: video.video_description,
      tiktok_share_url: video.share_url,
      tiktok_embed_url: video.embed_link,
    };

    const { error: updateError } = await supabaseAdmin.from("posts").update(postUpdate).eq("id", post.id);

    if (updateError) {
      console.error("Failed to update post with TikTok details:", updateError);
      // Continue to attempt analytics insertion
    }

    // 5. Insert the initial analytics record.
    const { error: analyticsError } = await supabaseAdmin.from("post_analytics").insert({
      post_id: post.id,
      likes: video.like_count || 0,
      comments: video.comment_count || 0,
      shares: video.share_count || 0,
      views: video.view_count || 0,
    });

    if (analyticsError) {
      // This might fail if a record already exists, which is fine.
      console.warn("Failed to insert initial post analytics (might already exist):", analyticsError.message);
    }

    return new Response(JSON.stringify({ message: `Successfully refreshed details for post ${id}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in tiktok-refresh-post-details:", error);
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
