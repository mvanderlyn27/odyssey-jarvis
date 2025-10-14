/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TIKTOK_CLIENT_KEY = Deno.env.get("VITE_TIKTOK_CLIENT_KEY");
const TIKTOK_CLIENT_SECRET = Deno.env.get("VITE_TIKTOK_CLIENT_SECRET");
const TIKTOK_REDIRECT_URI = Deno.env.get("VITE_TIKTOK_REDIRECT_URI");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, code_verifier } = await req.json();

    if (!code) throw new Error("Authorization code is missing.");
    if (!code_verifier) throw new Error("Code verifier is missing.");

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: TIKTOK_REDIRECT_URI,
        code_verifier: code_verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`TikTok Token API error: ${errorData.error_description}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user info from TikTok API
    const userResponse = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_large_url`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      const grantedScopes = tokenData.scope || "N/A";
      throw new Error(`TikTok User API error: ${errorData.error.message} (Granted Scopes: ${grantedScopes})`);
    }

    const userData = await userResponse.json();
    const userInfo = userData.data.user;

    // 3. Get the current Jarvis user and upsert data into the database
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

    const { error: upsertError } = await supabaseAdmin.from("tiktok_accounts").upsert(
      {
        tiktok_open_id: userInfo.open_id,
        tiktok_username: userInfo.username,
        tiktok_display_name: userInfo.display_name,
        tiktok_avatar_url: userInfo.avatar_large_url,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        refresh_expires_in: tokenData.refresh_expires_in,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
      },
      { onConflict: "tiktok_open_id" }
    );

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ message: "TikTok account linked successfully." }), {
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
