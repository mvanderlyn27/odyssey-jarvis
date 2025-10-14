/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TIKTOK_CLIENT_KEY = Deno.env.get("VITE_TIKTOK_CLIENT_KEY");
const TIKTOK_CLIENT_SECRET = Deno.env.get("VITE_TIKTOK_CLIENT_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { refresh_token } = await req.json();
    if (!refresh_token) {
      throw new Error("Refresh token is required.");
    }

    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`TikTok Token API error: ${errorData.error_description}`);
    }

    const tokenData = await tokenResponse.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseAdmin
      .from("tiktok_accounts")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        refresh_expires_in: tokenData.refresh_expires_in,
      })
      .eq("refresh_token", refresh_token);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify(tokenData), {
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
