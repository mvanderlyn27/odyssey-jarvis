/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest } from "../_shared/auth.ts";
import { getUserPlanFeatures } from "../_shared/get_user_plan_features.ts";

const TIKTOK_CLIENT_KEY = Deno.env.get("VITE_TIKTOK_CLIENT_KEY");
const TIKTOK_CLIENT_SECRET = Deno.env.get("VITE_TIKTOK_CLIENT_SECRET");
const TIKTOK_REDIRECT_URI = Deno.env.get("VITE_TIKTOK_REDIRECT_URI");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("[link-tiktok-account] Function invoked.");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[link-tiktok-account] Authenticating request.");
    const { error: authError } = await authenticateRequest(req);
    if (authError) {
      console.error("[link-tiktok-account] Authentication error:", authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    console.log("[link-tiktok-account] Authentication successful.");

    const { code, code_verifier } = await req.json();
    console.log("[link-tiktok-account] Received code and verifier.");

    if (!code) throw new Error("Authorization code is missing.");
    if (!code_verifier) throw new Error("Code verifier is missing.");

    // 1. Exchange authorization code for access token
    console.log("[link-tiktok-account] Exchanging authorization code for access token.");
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_key=${TIKTOK_CLIENT_KEY}&client_secret=${TIKTOK_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${TIKTOK_REDIRECT_URI}&code_verifier=${code_verifier}`,
    });

    const tokenData = await tokenResponse.json();
    console.log("[link-tiktok-account] Token response received:", tokenData);

    if (!tokenResponse.ok) {
      throw new Error(`TikTok Token API error: ${tokenData.error_description || "Unknown error"}`);
    }
    if (tokenData.error) {
      throw new Error(`TikTok Token API error: ${tokenData.error_description || tokenData.error}`);
    }
    const accessToken = tokenData.access_token;
    console.log("[link-tiktok-account] Access token obtained.");

    // 2. Fetch user info from TikTok API
    console.log("[link-tiktok-account] Fetching user info from TikTok API.");
    const userResponse = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_large_url`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("[link-tiktok-account] User info request failed. Raw response:", errorText);
      const grantedScopes = tokenData.scope || "N/A";
      throw new Error(`TikTok User API error: ${errorText} (Granted Scopes: ${grantedScopes})`);
    }

    const userData = await userResponse.json();
    console.log("[link-tiktok-account] User info response received:", userData);
    const userInfo = userData.data.user;
    console.log("[link-tiktok-account] User info obtained:", userInfo);

    // 3. Get the current Jarvis user and upsert data into the database
    console.log("[link-tiktok-account] Getting current Jarvis user.");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      data: { user: jarvisUser },
    } = await createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }).auth.getUser();

    if (!jarvisUser) throw new Error("Could not get Jarvis user.");
    console.log("[link-tiktok-account] Jarvis user found:", jarvisUser.id);

    // Check if the user has reached their max accounts limit
    console.log("[link-tiktok-account] Checking user plan features.");
    const features = await getUserPlanFeatures(jarvisUser.id);
    const { data: accounts, error: countError } = await supabaseAdmin
      .from("tiktok_accounts")
      .select("id", { count: "exact" })
      .eq("user_id", jarvisUser.id);

    if (countError) throw countError;

    if (accounts.length >= features.max_accounts) {
      throw new Error("You have reached the maximum number of accounts for your plan.");
    }
    console.log("[link-tiktok-account] User has not reached max accounts limit.");

    console.log("[link-tiktok-account] Upserting TikTok account data.");
    const { error: upsertError } = await supabaseAdmin.from("tiktok_accounts").upsert(
      {
        user_id: jarvisUser.id,
        open_id: userInfo.open_id,
        display_name: userInfo.display_name,
        username: userInfo.username,
        profile_image_url: userInfo.avatar_large_url,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        scope: tokenData.scope,
      },
      { onConflict: "open_id" }
    );

    if (upsertError) throw upsertError;
    console.log("[link-tiktok-account] TikTok account data upserted successfully.");

    // After successfully linking the account, trigger the video sync
    console.log("[link-tiktok-account] Triggering video sync.");
    const { data: newAccount } = await supabaseAdmin
      .from("tiktok_accounts")
      .select("id")
      .eq("open_id", userInfo.open_id)
      .single();

    if (newAccount) {
      await supabaseAdmin.functions.invoke("sync-tiktok-videos", {
        body: { account_id: newAccount.id },
      });
      console.log("[link-tiktok-account] Video sync triggered for account:", newAccount.id);
    }

    console.log("[link-tiktok-account] Function completed successfully.");
    return new Response(JSON.stringify({ message: "TikTok account linked and videos synced." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[link-tiktok-account] An error occurred:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
