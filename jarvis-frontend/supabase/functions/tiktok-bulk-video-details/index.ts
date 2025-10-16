/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

interface TikTokVideoStat {
  id: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { account_id, post_ids } = await req.json();
    if (!account_id) throw new Error("account_id is required.");
    if (!post_ids || !Array.isArray(post_ids) || post_ids.length === 0) {
      throw new Error("post_ids array is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: account, error: accountError } = await supabaseAdmin
      .from("tiktok_accounts")
      .select("access_token")
      .eq("id", account_id)
      .single();

    if (accountError) throw accountError;
    if (!account) throw new Error("TikTok account not found.");

    const BATCH_SIZE = 20;
    const batches = [];
    for (let i = 0; i < post_ids.length; i += BATCH_SIZE) {
      batches.push(post_ids.slice(i, i + BATCH_SIZE));
    }

    const fetchPromises = batches.map(async (batch) => {
      const url = new URL(`${TIKTOK_API_BASE}/video/query/`);
      url.searchParams.append("fields", "id,like_count,comment_count,share_count,view_count");

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters: { video_ids: batch } }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`TikTok Video Query API error for batch:`, errorData);
        return []; // Return empty array for failed batches
      }
      const { data } = await response.json();
      return data.videos as TikTokVideoStat[];
    });

    const results = await Promise.all(fetchPromises);
    const allVideoStats = results.flat();

    if (allVideoStats.length === 0) {
      return new Response(JSON.stringify({ message: "No video stats were updated." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { data: posts, error: postsError } = await supabaseAdmin
      .from("posts")
      .select("id, post_id")
      .in(
        "post_id",
        allVideoStats.map((v) => v.id)
      );

    if (postsError) throw postsError;

    const analyticsToUpsert = allVideoStats
      .map((video) => {
        const post = posts?.find((p) => p.post_id === video.id);
        if (!post) return null;
        return {
          post_id: post.id,
          likes: video.like_count,
          comments: video.comment_count,
          shares: video.share_count,
          views: video.view_count,
        };
      })
      .filter(Boolean);

    if (analyticsToUpsert.length > 0) {
      const { error: analyticsError } = await supabaseAdmin.from("post_analytics").insert(analyticsToUpsert);

      if (analyticsError) throw analyticsError;
    }

    return new Response(
      JSON.stringify({ message: `Successfully updated stats for ${analyticsToUpsert.length} videos.` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
