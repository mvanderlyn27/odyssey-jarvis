/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    if (!code) {
      throw new Error("Authorization code is missing.");
    }

    if (!code_verifier) {
      throw new Error("Code verifier is missing.");
    }

    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: TIKTOK_REDIRECT_URI,
        code_verifier: code_verifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TikTok API error: ${errorData.error_description}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
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
