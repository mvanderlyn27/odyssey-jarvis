// This function is designed to be run as a cron job.
// It fetches analytics for all tenants based on their subscription plan.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/tiktok-fetch.ts";
import { PlanFeatures } from "../../src/features/billing/types.ts"; // Assuming relative path is correct

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";
const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

interface TikTokVideoStat {
  id: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

interface Account {
  id: string;
  access_token: string;
  refresh_token: string;
  user_id: string;
  organization_id?: string;
}

interface PostAnalyticRaw {
  post_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  user_id: string;
  organization_id?: string;
}

// Fetches video stats for a single TikTok account, handling batching.
async function fetchVideoStatsForAccount(account: Account, postIds: string[]) {
  if (!postIds || postIds.length === 0) return;

  const BATCH_SIZE = 20;
  const batches = Array.from({ length: Math.ceil(postIds.length / BATCH_SIZE) }, (_, i) =>
    postIds.slice(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE)
  );

  const fetchPromises = batches.map(async (batch) => {
    const url = new URL(`${TIKTOK_API_BASE}/video/query/`);
    url.searchParams.append("fields", "id,like_count,comment_count,share_count,view_count");
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters: { video_ids: batch } }),
    };

    const response = await fetchWithRetry(
      url.toString(),
      options,
      account.refresh_token,
      Deno.env.get("INTERNAL_SECRET")!
    );
    if (!response.ok) {
      console.error(`TikTok API HTTP error for account ${account.id}`, await response.json());
      return [];
    }
    const responseData = await response.json();
    if (responseData.error?.code !== "ok") {
      console.error(`TikTok API logical error for account ${account.id}`, responseData.error);
      return [];
    }
    return (responseData.data?.videos as TikTokVideoStat[]) || [];
  });

  const results = await Promise.all(fetchPromises);
  const allVideoStats = results.flat();

  if (allVideoStats.length === 0) return;

  const { data: posts, error: postsError } = await supabaseAdmin
    .from("posts")
    .select("id, post_id")
    .in(
      "post_id",
      allVideoStats.map((v) => v.id)
    );

  if (postsError) throw postsError;
  if (!posts) return;

  const analyticsToInsert: PostAnalyticRaw[] = allVideoStats
    .map((video) => {
      const post = posts.find((p) => p.post_id === video.id);
      if (!post) return null;
      return {
        post_id: post.id,
        likes_count: video.like_count || 0,
        comments_count: video.comment_count || 0,
        shares_count: video.share_count || 0,
        views_count: video.view_count || 0,
        user_id: account.user_id,
        organization_id: account.organization_id,
      };
    })
    .filter((p): p is PostAnalyticRaw => p !== null);

  if (analyticsToInsert.length > 0) {
    const { error } = await supabaseAdmin.from("post_analytics_raw").insert(analyticsToInsert);
    if (error) throw error;
  }

  console.log(`Inserted ${analyticsToInsert.length} new analytics records for account ${account.id}.`);
}

// Main function triggered by cron job.
serve(async (req: Request) => {
  // Optional: Secure the endpoint with a secret
  const internalSecret = req.headers.get("X-Internal-Secret");
  if (internalSecret !== Deno.env.get("INTERNAL_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("Starting tenant-aware bulk analytics fetch.");

    // 1. Get all tenants with active, analytics-enabled subscriptions.
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, organization_id, plans ( features )")
      .eq("status", "active");

    if (subsError) throw subsError;

    const eligibleTenants = subscriptions.filter((sub) => {
      const features = sub.plans?.features as PlanFeatures;
      return features && features.analytics_granularity && features.analytics_granularity !== "off";
    });

    console.log(`Found ${eligibleTenants.length} tenants with analytics-enabled plans.`);

    // 2. Get all TikTok accounts linked to these tenants.
    const tenantUserIds = eligibleTenants.map((t) => t.user_id).filter(Boolean);
    const tenantOrgIds = eligibleTenants.map((t) => t.organization_id).filter(Boolean);

    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("tiktok_accounts")
      .select("id, access_token, refresh_token, user_id, organization_id, last_analytics_sync_at")
      .or(`user_id.in.(${tenantUserIds.join(",")}),organization_id.in.(${tenantOrgIds.join(",")})`);

    if (accountsError) throw accountsError;
    if (!accounts || accounts.length === 0) {
      return new Response("No accounts found for eligible tenants.", { status: 200 });
    }

    console.log(`Processing ${accounts.length} accounts across all eligible tenants.`);

    // 3. For each account, fetch its posts and trigger the analytics update.
    for (const account of accounts) {
      const tenantSub = eligibleTenants.find(
        (sub) => sub.user_id === account.user_id || sub.organization_id === account.organization_id
      );
      if (!tenantSub) continue;

      const features = tenantSub.plans?.features as PlanFeatures;
      const granularity = features.analytics_granularity;
      const lastSync = account.last_analytics_sync_at ? new Date(account.last_analytics_sync_at) : null;
      const now = new Date();

      let shouldSync = false;
      if (!lastSync) {
        shouldSync = true;
      } else {
        const timeDiffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        if (granularity === "raw" && timeDiffHours >= 0.5) shouldSync = true; // ~30 mins for "raw"
        if (granularity === "hourly" && timeDiffHours >= 1) shouldSync = true;
        if (granularity === "daily" && timeDiffHours >= 24) shouldSync = true;
      }

      if (!shouldSync) {
        console.log(`Skipping analytics sync for account ${account.id} based on granularity '${granularity}'.`);
        continue;
      }

      const { data: posts, error: postsError } = await supabaseAdmin
        .from("posts")
        .select("post_id")
        .eq("tiktok_account_id", account.id)
        .eq("status", "PUBLISHED")
        .not("post_id", "is", null);

      if (postsError) {
        console.error(`Failed to fetch posts for account ${account.id}:`, postsError);
        continue;
      }
      if (!posts || posts.length === 0) continue;

      const postIds = posts.map((p) => p.post_id).filter(Boolean);
      await fetchVideoStatsForAccount(account, postIds);

      // Update the sync timestamp
      await supabaseAdmin
        .from("tiktok_accounts")
        .update({ last_analytics_sync_at: now.toISOString() })
        .eq("id", account.id);
    }

    return new Response(JSON.stringify({ message: "Bulk analytics update completed successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("An unexpected error occurred in bulk analytics processing:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred.", details: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
