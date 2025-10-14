import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { v4 } from "https://deno.land/std@0.168.0/uuid/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { post_id } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch the original post and its assets
    const { data: originalPost, error: postError } = await supabaseAdmin
      .from("posts")
      .select("*, post_assets(*)")
      .eq("id", post_id)
      .single();

    if (postError) throw postError;

    // 2. Create a new post (the clone)
    const newPostId = crypto.randomUUID();
    const { data: newPost, error: newPostError } = await supabaseAdmin
      .from("posts")
      .insert({
        id: newPostId,
        title: `${originalPost.title} (Clone)`,
        description: originalPost.description,
        status: "DRAFT",
        user_id: originalPost.user_id,
        tiktok_account_id: originalPost.tiktok_account_id,
      })
      .select()
      .single();

    if (newPostError) throw newPostError;

    // 3. Clone assets
    if (originalPost.post_assets && originalPost.post_assets.length > 0) {
      const newAssets = [];
      for (const asset of originalPost.post_assets) {
        const newAssetId = crypto.randomUUID();
        const oldPath = asset.asset_url.split("/").slice(-2).join("/");
        const newPath = `${newPostId}/${newAssetId}`;

        // Copy file in storage
        const { error: storageError } = await supabaseAdmin.storage.from("posts").copy(oldPath, newPath);

        if (storageError) {
          console.error("Storage error:", storageError);
          continue; // Or handle error more gracefully
        }

        const { data: urlData } = supabaseAdmin.storage.from("posts").getPublicUrl(newPath);

        newAssets.push({
          id: newAssetId,
          post_id: newPostId,
          asset_url: urlData.publicUrl,
          asset_type: asset.asset_type,
          order: asset.order,
        });
      }

      const { error: newAssetsError } = await supabaseAdmin.from("post_assets").insert(newAssets);

      if (newAssetsError) throw newAssetsError;
    }

    const { data: finalPost, error: finalPostError } = await supabaseAdmin
      .from("posts")
      .select("*, post_assets(*)")
      .eq("id", newPostId)
      .single();

    if (finalPostError) throw finalPostError;

    return new Response(JSON.stringify({ post: finalPost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
