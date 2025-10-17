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

    const fields = ["display_name", "avatar_url"];
    const url = `https://open.tiktokapis.com/v2/user/info/?fields=${fields.join(",")}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TikTok User Info API error: ${errorData.error.message}`);
    }

    const { data: userDetails } = await response.json();
    const avatarUrl = userDetails.user.avatar_url;

    // Download the avatar image
    const avatarResponse = await fetch(avatarUrl);
    if (!avatarResponse.ok) {
      throw new Error("Failed to download avatar image");
    }
    const avatarBlob = await avatarResponse.blob();

    // Upload the avatar to Supabase storage
    const avatarPath = `${accountId}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("account_avatars")
      .upload(avatarPath, avatarBlob, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }

    // Get the public URL of the uploaded avatar
    const { data: publicUrlData } = supabase.storage.from("account_avatars").getPublicUrl(avatarPath);

    const { data: updatedAccount, error: updateError } = await supabase
      .from("tiktok_accounts")
      .update({
        tiktok_display_name: userDetails.user.display_name,
        tiktok_username: userDetails.username,
        tiktok_avatar_url: publicUrlData.publicUrl,
      })
      .eq("id", accountId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update account profile: ${updateError.message}`);
    }

    return new Response(JSON.stringify(updatedAccount), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
