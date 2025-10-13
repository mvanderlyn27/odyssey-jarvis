/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { access_token, open_id } = await req.json();
    if (!access_token) throw new Error("Access token is required.");
    if (!open_id) throw new Error("TikTok Open ID is required.");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userResponse = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      // If the token is expired, mark the account as such
      await supabaseAdmin.from("tiktok_accounts").update({ token_status: "expired" }).eq("tiktok_open_id", open_id);

      const errorData = await userResponse.json();
      throw new Error(`TikTok User API error: ${errorData.error.message}`);
    }

    const userData = await userResponse.json();
    const { follower_count, likes_count } = userData.data.user;

    // Update the stats in the database
    const { error: updateError } = await supabaseAdmin
      .from("tiktok_accounts")
      .update({
        follower_count,
        likes_count,
        stats_updated_at: new Date().toISOString(),
      })
      .eq("tiktok_open_id", open_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ follower_count, likes_count }), {
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
