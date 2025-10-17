// @deno-types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://esm.sh/blurhash@2.0.5";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const THUMBNAIL_WIDTH = 200;

interface Record {
  id: string;
  bucket_id: string;
  name: string;
}

serve(async (req: Request) => {
  let path: string | undefined;
  try {
    console.log("Function invoked.");
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    const { record } = payload;
    if (!record) {
      console.log("No record found in payload, exiting.");
      return new Response(JSON.stringify({ message: "No record found in payload." }), { status: 200 });
    }

    path = record.name;
    const { bucket_id } = record as Record;
    console.log(`Record details: path=${path}, bucket_id=${bucket_id}`);

    if (bucket_id !== "tiktok_assets") {
      console.log(`Not a tiktok_asset (bucket: ${bucket_id}), skipping.`);
      return new Response(JSON.stringify({ message: "Not a tiktok_asset, skipping." }), { status: 200 });
    }

    if (!path || !path.startsWith("slides/") || path.endsWith("_thumb")) {
      console.log(`Not a slide asset or is already a thumbnail (path: ${path}), skipping.`);
      return new Response(JSON.stringify({ message: "Not a slide asset or is already a thumbnail, skipping." }), {
        status: 200,
      });
    }

    console.log("Asset validation passed. Initializing Supabase client.");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    console.log("Supabase client initialized.");

    console.log(`Processing new asset: ${path}`);

    const { data: blob, error: downloadError } = await supabaseAdmin.storage.from("tiktok_assets").download(path);
    if (downloadError) throw new Error(`Failed to download image: ${downloadError.message}`);
    console.log("Image downloaded successfully.");

    const imageBuffer = await blob.arrayBuffer();
    console.log("Image buffer created.");
    const image = await Image.decode(imageBuffer);
    console.log("Image decoded successfully.");

    let blurhash: string | undefined;
    let thumbnailPath: string | undefined;

    try {
      const thumbnail = image.resize(THUMBNAIL_WIDTH, Image.RESIZE_AUTO);
      console.log("Thumbnail resized.");

      blurhash = encode(thumbnail.bitmap, thumbnail.width, thumbnail.height, 4, 3);
      console.log(`Blurhash generated: ${blurhash}`);

      const thumbnailBuffer = await thumbnail.encodeJPEG(80);
      console.log("Thumbnail encoded to JPEG.");

      // Append _thumb to the path to create a unique name for the thumbnail
      thumbnailPath = `${path}_thumb`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("tiktok_assets")
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
      }
      console.log(`Thumbnail uploaded to: ${thumbnailPath}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during image processing";
      console.error(`Failed to process image ${path}:`, errorMessage);
      return new Response(JSON.stringify({ message: "Failed to process image.", error: errorMessage }), {
        status: 500,
      });
    }

    // If processing was successful, update the database
    const { data: updatedAssets, error: updateError } = await supabaseAdmin
      .from("post_assets")
      .update({
        blurhash: blurhash,
        thumbnail_path: thumbnailPath,
      })
      .eq("asset_url", path)
      .select();

    if (updateError) {
      throw new Error(`Failed to update post_assets: ${updateError.message}`);
    }

    if (!updatedAssets || updatedAssets.length === 0) {
      console.log(`No post_asset record found for asset_url: ${path}`);
    } else {
      console.log(`Successfully updated ${updatedAssets.length} post_asset record(s) for: ${path}`);
    }

    return new Response(JSON.stringify({ message: "Asset processed successfully." }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error processing asset ${path || "unknown"}:`, errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  } finally {
    console.log("Function execution finished.");
  }
});
