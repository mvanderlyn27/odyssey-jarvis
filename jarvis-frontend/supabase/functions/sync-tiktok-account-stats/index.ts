import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateRequest } from "../_shared/auth.ts";
import { fetchWithRetry } from "../_shared/tiktok-fetch.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let accountId: string | null = null;
  try {
    const { error: authError } = await authenticateRequest(req);
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const body = await req.json();
    accountId = body.accountId;
    if (!accountId) {
      throw new Error("Missing accountId");
    }

    const { data: account, error: accountError } = await supabase
      .from("tiktok_accounts")
      .select("access_token, refresh_token")
      .eq("id", accountId)
      .single();

    if (accountError) {
      throw new Error(`Failed to fetch account: ${accountError.message}`);
    }

    const fields = ["follower_count", "following_count", "likes_count", "video_count"];
    const url = `https://open.tiktokapis.com/v2/user/info/?fields=${fields.join(",")}`;

    const authorization = req.headers.get("Authorization") ?? req.headers.get("X-Internal-Secret");
    if (!authorization) {
      throw new Error("Missing authorization headers.");
    }

    const response = await fetchWithRetry(
      url,
      {
        headers: { Authorization: `Bearer ${account.access_token}` },
      },
      account.refresh_token,
      authorization
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("TikTok User Info API error:", errorData);
      throw new Error(`TikTok User Info API error: ${errorData.error.message}`);
    }

    const responseData = await response.json();

    if (responseData.error && responseData.error.code !== "ok") {
      console.error("TikTok User Info API response error:", responseData.error);
      throw new Error(`TikTok User Info API error: ${responseData.error.message}`);
    }

    if (!responseData.data || !responseData.data.user) {
      console.error("TikTok User Info API response missing user data:", responseData);
      throw new Error("TikTok User Info API response missing user data");
    }

    const userDetails = responseData.data;

    const { data: latestAnalytics, error: latestAnalyticsError } = await supabase
      .rpc("get_latest_account_analytics")
      .eq("account_id", accountId)
      .single();

    if (latestAnalyticsError && latestAnalyticsError.code !== "PGRST116") {
      throw new Error(`Failed to fetch latest account analytics: ${latestAnalyticsError.message}`);
    }

    const analyticsPayload = {
      tiktok_account_id: accountId,
      follower_count: userDetails.user.follower_count,
      following_count: userDetails.user.following_count,
      likes_count: userDetails.user.likes_count,
      video_count: userDetails.user.video_count,
      total_post_views: latestAnalytics?.total_post_views || 0,
      total_post_likes: latestAnalytics?.total_post_likes || 0,
      total_post_comments: latestAnalytics?.total_post_comments || 0,
      total_post_shares: latestAnalytics?.total_post_shares || 0,
      total_post_views_delta: (latestAnalytics?.total_post_views || 0) - (latestAnalytics?.total_post_views || 0),
      total_post_likes_delta: (latestAnalytics?.total_post_likes || 0) - (latestAnalytics?.total_post_likes || 0),
      total_post_comments_delta:
        (latestAnalytics?.total_post_comments || 0) - (latestAnalytics?.total_post_comments || 0),
      total_post_shares_delta: (latestAnalytics?.total_post_shares || 0) - (latestAnalytics?.total_post_shares || 0),
      follower_count_delta: userDetails.user.follower_count - (latestAnalytics?.follower_count || 0),
      following_count_delta: userDetails.user.following_count - (latestAnalytics?.following_count || 0),
      likes_count_delta: userDetails.user.likes_count - (latestAnalytics?.likes_count || 0),
      video_count_delta: userDetails.user.video_count - (latestAnalytics?.video_count || 0),
    };

    console.log(`Inserting analytics for accountId: ${accountId}`, analyticsPayload);

    const { data: analytics, error: analyticsError } = await supabase
      .from("account_analytics_raw")
      .insert(analyticsPayload)
      .select()
      .single();

    if (analyticsError) {
      throw new Error(`Failed to insert account analytics: ${analyticsError.message}`);
    }

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in sync-tiktok-account-stats for accountId:", accountId);
    console.error("Error details:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
