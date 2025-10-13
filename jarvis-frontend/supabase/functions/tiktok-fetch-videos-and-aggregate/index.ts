/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accessTokens } = await req.json();

    if (!accessTokens || !Array.isArray(accessTokens) || accessTokens.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid accessTokens" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get the authorization header from the original request
    const authorization = req.headers.get("Authorization")!;

    // Fetch all videos for the given accounts in parallel
    const videoPromises = accessTokens.map((accessToken: string) =>
      supabase.functions.invoke("tiktok-video-list", {
        body: { access_token: accessToken },
        headers: {
          Authorization: authorization,
        },
      })
    );

    const videoResults = await Promise.all(videoPromises);

    const allVideos = videoResults
      .flatMap((result: any) => {
        // result.error is for function invocation errors
        if (result.error) {
          console.error("Error invoking tiktok-video-list:", result.error);
          return [];
        }
        // result.data contains the body from the invoked function.
        // We need to check for errors returned from the TikTok API itself.
        if (result.data.error && result.data.error.code !== "ok") {
          console.error("Error from TikTok API:", result.data.error.message);
          return [];
        }
        // The actual video list is nested under another 'data' property
        return result.data.data?.videos || [];
      })
      .filter(Boolean);

    const aggregatedStats = allVideos.reduce(
      (acc: any, video: any) => {
        acc.totalViews += video.view_count || 0;
        acc.totalLikes += video.like_count || 0;
        acc.totalComments += video.comment_count || 0;
        acc.totalShares += video.share_count || 0;
        return acc;
      },
      { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
    );

    return new Response(JSON.stringify({ aggregatedStats, videos: allVideos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
