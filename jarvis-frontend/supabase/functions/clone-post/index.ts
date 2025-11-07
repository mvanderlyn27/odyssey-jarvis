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
        organization_id: originalPost.organization_id,
        tiktok_account_id: originalPost.tiktok_account_id,
      })
      .select()
      .single();

    if (newPostError) throw newPostError;

    // 3. Clone assets
    if (originalPost.post_assets && originalPost.post_assets.length > 0) {
      const bucketName = "tiktok_assets";
      const oldPostId = originalPost.id;
      const assetType = originalPost.post_assets[0].asset_type;
      const oldPostFolderPath = `${assetType}/${oldPostId}`;
      const newPostFolderPath = `${assetType}/${newPostId}`;

      // Get the folder path of the original post's assets
      const { data: files, error: listError } = await supabaseAdmin.storage.from(bucketName).list(oldPostFolderPath);

      if (listError) {
        console.error(`Error listing files in ${oldPostFolderPath}:`, listError);
        throw listError;
      }

      // Copy all files from the old folder to a new folder for the cloned post
      for (const file of files) {
        const oldPath = `${oldPostFolderPath}/${file.name}`;
        const newPath = `${newPostFolderPath}/${file.name}`;
        const { error: copyError } = await supabaseAdmin.storage.from(bucketName).copy(oldPath, newPath);

        if (copyError) {
          console.error(`Error copying ${oldPath} to ${newPath}:`, copyError);
          throw copyError;
        }
      }

      // Create new post_assets records with the correct paths
      const newAssets = originalPost.post_assets.map((asset: any) => {
        const oldUrl = new URL(asset.asset_url);
        const oldPath = oldUrl.pathname.substring(oldUrl.pathname.indexOf(bucketName) + bucketName.length + 1);
        const fileName = oldPath.split("/").pop();
        const newPath = `${newPostFolderPath}/${fileName}`;

        const newThumbnailPath = asset.thumbnail_path ? asset.thumbnail_path.replace(oldPostId, newPostId) : null;

        return {
          id: crypto.randomUUID(),
          post_id: newPostId,
          asset_url: newPath,
          asset_type: asset.asset_type,
          sort_order: asset.sort_order,
          blurhash: asset.blurhash,
          thumbnail_path: newThumbnailPath,
        };
      });

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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
