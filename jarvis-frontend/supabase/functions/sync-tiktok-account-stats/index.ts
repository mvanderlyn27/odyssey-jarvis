import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accountId } = await req.json();
    if (!accountId) {
      throw new Error("Missing accountId");
    }

    const { data: account, error: accountError } = await supabase
      .from("tiktok_accounts")
      .select("access_token")
      .eq("id", accountId)
      .single();

    if (accountError) {
      throw new Error(`Failed to fetch account: ${accountError.message}`);
    }

    const fields = ["follower_count", "following_count", "likes_count", "video_count"];
    const url = `https://open.tiktokapis.com/v2/user/info/?fields=${fields.join(",")}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TikTok User Info API error: ${errorData.error.message}`);
    }

    const { data: userDetails } = await response.json();

    const { data: latestAnalytics, error: latestAnalyticsError } = await supabase
      .from("account_analytics")
      .select("*")
      .eq("tiktok_account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestAnalyticsError && latestAnalyticsError.code !== "PGRST116") {
      throw new Error(`Failed to fetch latest account analytics: ${latestAnalyticsError.message}`);
    }

    const { data: postAnalytics, error: postAnalyticsError } = await supabase
      .from("post_analytics")
      .select("views, likes, comments, shares")
      .eq("post_id", accountId);

    if (postAnalyticsError) {
      throw new Error(`Failed to fetch post analytics: ${postAnalyticsError.message}`);
    }

    const totalPostViews = postAnalytics.reduce((acc: number, cur: any) => acc + (cur.views || 0), 0);
    const totalPostLikes = postAnalytics.reduce((acc: number, cur: any) => acc + (cur.likes || 0), 0);
    const totalPostComments = postAnalytics.reduce((acc: number, cur: any) => acc + (cur.comments || 0), 0);
    const totalPostShares = postAnalytics.reduce((acc: number, cur: any) => acc + (cur.shares || 0), 0);

    const { data: analytics, error: analyticsError } = await supabase
      .from("account_analytics")
      .insert({
        tiktok_account_id: accountId,
        follower_count: userDetails.user.follower_count,
        following_count: userDetails.user.following_count,
        likes_count: userDetails.user.likes_count,
        video_count: userDetails.user.video_count,
        total_post_views: totalPostViews,
        total_post_likes: totalPostLikes,
        total_post_comments: totalPostComments,
        total_post_shares: totalPostShares,
        total_post_views_delta: totalPostViews - (latestAnalytics?.total_post_views || 0),
        total_post_likes_delta: totalPostLikes - (latestAnalytics?.total_post_likes || 0),
        total_post_comments_delta: totalPostComments - (latestAnalytics?.total_post_comments || 0),
        total_post_shares_delta: totalPostShares - (latestAnalytics?.total_post_shares || 0),
        follower_count_delta: userDetails.user.follower_count - (latestAnalytics?.follower_count || 0),
        following_count_delta: userDetails.user.following_count - (latestAnalytics?.following_count || 0),
        likes_count_delta: userDetails.user.likes_count - (latestAnalytics?.likes_count || 0),
        video_count_delta: userDetails.user.video_count - (latestAnalytics?.video_count || 0),
      })
      .select()
      .single();

    if (analyticsError) {
      throw new Error(`Failed to insert account analytics: ${analyticsError.message}`);
    }

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
