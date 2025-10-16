import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accountId } = await req.json();
    if (!accountId) {
      throw new Error("Missing accountId");
    }

    const { data: account, error: accountError } = await supabase
      .from("tiktok_accounts")
      .select("access_token")
      .eq("id", accountId)
      .single();

    if (accountError) {
      throw new Error(`Failed to fetch account: ${accountError.message}`);
    }

    const fields = ["follower_count", "following_count", "likes_count", "video_count"];
    const url = `https://open.tiktokapis.com/v2/user/info/?fields=${fields.join(",")}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TikTok User Info API error: ${errorData.error.message}`);
    }

    const { data: userDetails } = await response.json();

    const { data: updatedAccount, error: updateError } = await supabase
      .from("tiktok_accounts")
      .update({
        follower_count: userDetails.user.follower_count,
        following_count: userDetails.user.following_count,
        likes_count: userDetails.user.likes_count,
        video_count: userDetails.user.video_count,
      })
      .eq("id", accountId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update account stats: ${updateError.message}`);
    }

    const { error: analyticsError } = await supabase.from("tiktok_account_analytics").insert({
      tiktok_account_id: accountId,
      follower_count: userDetails.user.follower_count,
      following_count: userDetails.user.following_count,
      likes_count: userDetails.user.likes_count,
      video_count: userDetails.user.video_count,
    });

    if (analyticsError) {
      console.error("Failed to insert account analytics:", analyticsError);
    }

    return new Response(JSON.stringify(updatedAccount), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
