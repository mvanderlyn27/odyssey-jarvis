/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest } from "../_shared/auth.ts";

const TIKTOK_CLIENT_KEY = Deno.env.get("VITE_TIKTOK_CLIENT_KEY");
const TIKTOK_CLIENT_SECRET = Deno.env.get("VITE_TIKTOK_CLIENT_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("tiktok-refresh-token function invoked.");
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { error: authError } = await authenticateRequest(req);
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const { refresh_token } = await req.json();
    if (!refresh_token) {
      console.error("Refresh token is required but was not provided.");
      throw new Error("Refresh token is required.");
    }
    console.log("Attempting to refresh token.");

    const requestBody = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    });

    console.log("Request body sent to TikTok:", requestBody.toString());

    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: requestBody,
    });

    const responseBodyText = await tokenResponse.text();
    console.log("Received response from TikTok:", responseBodyText);

    if (!tokenResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseBodyText);
        console.error("TikTok Token API error:", errorData);
      } catch (e) {
        console.error("Could not parse error response from TikTok:", responseBodyText);
        errorData = { error_description: "Unknown error from TikTok API." };
      }
      throw new Error(`TikTok Token API error: ${errorData.error_description}`);
    }

    const tokenData = JSON.parse(responseBodyText);
    console.log("Successfully refreshed token. New token data:", tokenData);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseAdmin
      .from("tiktok_accounts")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      })
      .eq("refresh_token", refresh_token);

    if (updateError) {
      console.error("Failed to update tiktok_accounts table:", updateError);
      throw updateError;
    }

    console.log("Successfully updated tiktok_accounts table.");

    return new Response(JSON.stringify(tokenData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("An error occurred in tiktok-refresh-token:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
