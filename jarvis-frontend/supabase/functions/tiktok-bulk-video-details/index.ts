/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/tiktok-fetch.ts";

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

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
}

interface PostAnalytic {
  post_id: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

async function fetchVideoStatsForAccount(account: Account, postIds: string[]) {
  if (!postIds || postIds.length === 0) {
    console.log(`No posts to update for account ${account.id}.`);
    return;
  }

  const BATCH_SIZE = 20;
  const batches = [];
  for (let i = 0; i < postIds.length; i += BATCH_SIZE) {
    batches.push(postIds.slice(i, i + BATCH_SIZE));
  }

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
      `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error JSON" }));
      console.error(
        `TikTok Video Query API HTTP error for account ${account.id}, status: ${response.status}, batch:`,
        errorData
      );
      return []; // Return empty on HTTP error
    }

    const responseData = await response.json();

    // TikTok API can return 200 OK but still have an error in the body
    if (responseData.error && responseData.error.code !== "ok") {
      console.error(`TikTok Video Query API logical error for account ${account.id}, batch:`, responseData.error);
      // Here we could handle specific errors, e.g., refresh token if expired
      return []; // Return empty on logical error
    }

    const videos = responseData.data?.videos as TikTokVideoStat[];

    // Validate the data before returning
    if (!videos || !Array.isArray(videos)) {
      console.warn(
        `TikTok API returned unexpected data structure for account ${account.id}. Expected 'data.videos' array.`,
        responseData
      );
      return [];
    }

    return videos;
  });

  const results = await Promise.all(fetchPromises);
  const allVideoStats = results.flat();

  if (allVideoStats.length === 0) {
    return;
  }

  const { data: posts, error: postsError } = await supabaseAdmin
    .from("posts")
    .select("id, post_id, created_at")
    .in(
      "post_id",
      allVideoStats.map((v: TikTokVideoStat) => v.id)
    );

  if (postsError) throw postsError;
  if (!posts) return;

  // Fetch all analytics for these posts and determine the latest one for each.
  const internalPostIds = posts.map((p: { id: string }) => p.id);
  const { data: allAnalytics, error: latestAnalyticsError } = await supabaseAdmin
    .from("post_analytics")
    .select("post_id, likes, comments, shares, views, created_at")
    .in("post_id", internalPostIds);

  if (latestAnalyticsError) throw latestAnalyticsError;

  // Manually find the latest analytic for each post.
  const latestAnalyticsMap = new Map<string, PostAnalytic & { created_at: string }>();
  if (allAnalytics) {
    for (const analytic of allAnalytics) {
      const existing = latestAnalyticsMap.get(analytic.post_id);
      if (!existing || new Date(analytic.created_at) > new Date(existing.created_at)) {
        latestAnalyticsMap.set(analytic.post_id, analytic);
      }
    }
  }
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const analyticsToUpsert = allVideoStats
    .map((video) => {
      const post = posts.find((p: { id: string; post_id: string; created_at: string }) => p.post_id === video.id);
      if (!post) return null;

      const postCreationDate = new Date(post.created_at);
      const latest = latestAnalyticsMap.get(post.id);

      // Failsafe: Ensure new analytic values are not less than the latest recorded ones.
      const newLikes = latest ? Math.max(latest.likes, video.like_count || 0) : video.like_count || 0;
      const newComments = latest ? Math.max(latest.comments, video.comment_count || 0) : video.comment_count || 0;
      const newShares = latest ? Math.max(latest.shares, video.share_count || 0) : video.share_count || 0;
      const newViews = latest ? Math.max(latest.views, video.view_count || 0) : video.view_count || 0;

      // If the post is older than 30 days, check if stats have changed.
      if (postCreationDate < thirtyDaysAgo && latest) {
        const statsChanged =
          newLikes !== latest.likes ||
          newComments !== latest.comments ||
          newShares !== latest.shares ||
          newViews !== latest.views;

        if (!statsChanged) {
          return null; // Stats are the same, so we skip inserting a new record.
        }
      }

      return {
        post_id: post.id,
        likes: newLikes,
        comments: newComments,
        shares: newShares,
        views: newViews,
      };
    })
    .filter((p): p is PostAnalytic => p !== null);

  if (analyticsToUpsert.length > 0) {
    const { error: analyticsError } = await supabaseAdmin.from("post_analytics").insert(analyticsToUpsert);
    if (analyticsError) throw analyticsError;
  }

  console.log(`Successfully updated stats for ${analyticsToUpsert.length} videos for account ${account.id}.`);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("tiktok-bulk-video-details function invoked.", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  try {
    // It's crucial to know what payload we receive, especially from the cron job.
    const payload = await req.json().catch((error) => {
      console.warn("Could not parse JSON from request body. Proceeding with empty payload.", error.message);
      return {};
    });
    console.log("Received payload:", payload);

    const { account_id, post_ids } = payload;

    // Mode 1: On-demand fetch for a specific account and posts (from frontend)
    if (account_id && post_ids) {
      if (!Array.isArray(post_ids) || post_ids.length === 0) {
        throw new Error("post_ids array is required when account_id is provided.");
      }

      const { data: account, error: accountError } = await supabaseAdmin
        .from("tiktok_accounts")
        .select("id, access_token, refresh_token")
        .eq("id", account_id)
        .single();

      if (accountError) throw accountError;
      if (!account) throw new Error("TikTok account not found.");

      await fetchVideoStatsForAccount(account, post_ids);

      return new Response(JSON.stringify({ message: `Successfully processed stats for account ${account_id}.` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Mode 2: Bulk fetch for all accounts (from cron job)
    console.log("Starting bulk analytics fetch for all accounts.");
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("tiktok_accounts")
      .select("id, access_token, refresh_token");

    if (accountsError) {
      console.error("Error fetching tiktok_accounts:", accountsError);
      throw accountsError;
    }

    if (!accounts || accounts.length === 0) {
      console.log("No active TikTok accounts found to process.");
    } else {
      console.log(`Found ${accounts.length} active accounts to process.`);
    }

    for (const account of accounts) {
      const { data: posts, error: postsError } = await supabaseAdmin
        .from("posts")
        .select("post_id")
        .eq("tiktok_account_id", account.id)
        .eq("status", "PUBLISHED")
        .not("post_id", "is", null)
        .neq("post_id", "");

      if (postsError) {
        console.error(`Failed to fetch posts for account ${account.id}:`, postsError);
        continue; // Skip to the next account
      }

      // Defensive coding: ensure posts is an array before processing.
      if (!Array.isArray(posts)) {
        console.warn(`Received non-array data for posts for account ${account.id}. Skipping.`);
        continue;
      }

      // Log the raw posts data from the database to see what we're working with.
      console.log(`Fetched ${posts.length} raw posts for account ${account.id}:`, JSON.stringify(posts, null, 2));

      const accountPostIds = posts
        .map((p: { post_id: string | null }) => p.post_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0);

      console.log(`Processing ${accountPostIds.length} valid posts for account ${account.id}.`, {
        postIds: accountPostIds,
      });
      await fetchVideoStatsForAccount(account, accountPostIds);
    }

    return new Response(JSON.stringify({ message: "Successfully completed bulk analytics update." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    // Log the full error object for better debugging.
    console.error("An unexpected error occurred:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred.", details: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500, // Use 500 for internal server errors
    });
  }
});
