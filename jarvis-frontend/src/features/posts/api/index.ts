import { supabase } from "@/lib/supabase/jarvisClient";
import { Asset } from "../types";

const getFileType = (fileType: string) => {
  if (fileType.startsWith("image/")) return "slides";
  if (fileType.startsWith("video/")) return "videos";
  return "unknown";
};

export const uploadMedia = async (file: File, filePath: string) => {
  const fileType = getFileType(file.type);
  if (fileType === "unknown") {
    throw new Error("Unsupported file type.");
  }

  const { data, error } = await supabase.storage.from("tiktok_assets").upload(filePath, file);

  if (error) {
    throw new Error(`Storage Error: ${error.message}`);
  }

  if (!data) {
    throw new Error("Upload failed: No data returned from storage.");
  }

  return { asset_type: fileType, asset_url: data.path };
};

export const createPost = async () => {
  const { data, error } = await supabase.from("posts").insert({}).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updatePostAssets = async (postId: number, assets: { id: string; sort_order: number }[]) => {
  const updates = assets.map((asset, index) => ({
    id: asset.id,
    sort_order: index + 1,
  }));

  const { data, error } = await supabase.from("post_assets").upsert(updates).eq("post_id", postId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPost = async (postId: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_assets (*)
    `
    )
    .eq("id", postId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPostById = async (postId: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*, post_assets(*), tiktok_accounts(*)")
    .eq("id", postId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updatePost = async (postId: number, updates: { title?: string; description?: string }) => {
  const { data, error } = await supabase.from("posts").update(updates).eq("id", postId).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deletePost = async (postId: string) => {
  const { data: assets, error: assetsError } = await supabase
    .from("post_assets")
    .select("asset_url, thumbnail_path")
    .eq("post_id", postId);

  if (assetsError) {
    throw new Error(`Failed to fetch assets for post: ${assetsError.message}`);
  }

  if (assets && assets.length > 0) {
    const pathsToDelete = assets
      .map((a) => [a.asset_url, a.thumbnail_path])
      .flat()
      .filter(Boolean) as string[];

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from("tiktok_assets").remove(pathsToDelete);
      if (storageError) {
        // Log the error but don't throw, to allow the post deletion to proceed
        console.error(`Failed to delete assets from storage: ${storageError.message}`);
      }
    }
  }

  const { error: postError } = await supabase.from("posts").delete().eq("id", postId);

  if (postError) {
    throw new Error(postError.message);
  }
};

export const addPostAsset = async (asset: {
  post_id: number;
  asset_url: string;
  asset_type: string;
  sort_order: number;
}) => {
  const { data, error } = await supabase.from("post_assets").insert(asset).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const syncPostAssets = async (postId: number, assets: Asset[]) => {
  const deletedAssets = assets.filter((asset) => asset.status === "deleted");
  if (deletedAssets.length > 0) {
    const { error } = await supabase
      .from("post_assets")
      .delete()
      .in(
        "id",
        deletedAssets.map((a) => a.id)
      );
    if (error) throw new Error(error.message);
  }

  const newOrModifiedAssets = assets.filter((asset) => asset.status === "new" || asset.status === "modified");
  for (const asset of newOrModifiedAssets) {
    if (asset.file) {
      const filePath = `${asset.asset_type}/${postId}/${asset.id}`;
      const uploadedMedia = await uploadMedia(asset.file, filePath);
      asset.asset_url = uploadedMedia.asset_url;
    }
  }

  const orderedAssets = assets
    .filter((asset) => asset.status !== "deleted")
    .map((asset, index) => ({
      id: asset.id,
      post_id: postId,
      asset_url: asset.asset_url,
      asset_type: asset.asset_type,
      sort_order: index,
    }));

  if (orderedAssets.length > 0) {
    const { data, error } = await supabase.from("post_assets").upsert(orderedAssets).select();
    if (error) throw new Error(error.message);
    return data;
  }

  return [];
};

export const savePostChanges = async (post: any) => {
  if (!post?.id) throw new Error("No post to save");

  // 1. Update post title, description, and status
  const updates: any = {
    title: post.title,
    description: post.description,
  };
  if (post.status === "FAILED") {
    updates.status = "DRAFT";
  }
  const { error: postUpdateError } = await supabase.from("posts").update(updates).eq("id", post.id);
  if (postUpdateError) throw new Error(`Failed to update post: ${postUpdateError.message}`);

  // 2. Prepare the final list of assets to be saved in the database
  const finalAssets = post.post_assets
    .filter((asset: Asset) => asset.status !== "deleted")
    .map((asset: Asset, index: number) => ({
      id: asset.id,
      post_id: post.id,
      asset_url: asset.asset_url, // The URL is already correctly set in useSavePost
      asset_type: asset.asset_type,
      sort_order: index,
      blurhash: asset.blurhash,
      thumbnail_path: asset.thumbnail_path,
    }));

  // 3. Upsert the assets into the database
  if (finalAssets.length > 0) {
    const { error: upsertError } = await supabase.from("post_assets").upsert(finalAssets).select();
    if (upsertError) throw new Error(`Failed to upsert post assets: ${upsertError.message}`);
  }

  return post;
};

export const clonePost = async (postId: string, newFiles?: { file: File }[]) => {
  const { data: originalPost, error: fetchError } = await supabase
    .from("posts")
    .select("*, post_assets(*)")
    .eq("id", postId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch original post: ${fetchError.message}`);

  const { data: newPost, error: createError } = await supabase
    .from("posts")
    .insert({
      title: `${originalPost.title} (Copy)`,
      description: originalPost.description,
      status: "DRAFT",
    })
    .select()
    .single();

  if (createError) throw new Error(`Failed to create new post: ${createError.message}`);

  const assetsToClone = originalPost.post_assets;

  if (assetsToClone && assetsToClone.length > 0) {
    const newAssets = await Promise.all(
      assetsToClone
        .filter((asset: Asset) => asset.asset_url)
        .map(async (asset: Asset, index: number) => {
          const fromPath = asset.asset_url!;
          let toPath: string;

          if (fromPath.includes(`/${postId}/`)) {
            toPath = fromPath.replace(`/${postId}/`, `/${newPost.id}/`);
          } else {
            const fileName = fromPath.split("/").pop();
            toPath = `${asset.asset_type}/${newPost.id}/${fileName}`;
          }

          const { error: copyError } = await supabase.storage.from("tiktok_assets").copy(fromPath, toPath);
          if (copyError) {
            console.error("Failed to copy asset:", fromPath, "to", toPath, copyError);
            throw new Error(`Failed to copy asset: ${copyError.message}`);
          }

          return {
            post_id: newPost.id,
            asset_url: toPath,
            asset_type: asset.asset_type,
            sort_order: index,
          };
        })
    );

    const { error: assetsError } = await supabase.from("post_assets").insert(newAssets);
    if (assetsError) throw new Error(`Failed to create new post assets: ${assetsError.message}`);
  }

  if (newFiles && newFiles.length > 0) {
    const uploadPromises = newFiles.map(async (fileData, index) => {
      const fileType = getFileType(fileData.file.type);
      const assetId = crypto.randomUUID();
      const filePath = `${fileType}/${newPost.id}/${assetId}`;
      const { asset_url, asset_type } = await uploadMedia(fileData.file, filePath);
      return {
        id: assetId,
        post_id: newPost.id,
        asset_url,
        asset_type,
        sort_order: (assetsToClone?.length || 0) + index,
      };
    });

    const newUploadedAssets = await Promise.all(uploadPromises);
    const { error: assetsError } = await supabase.from("post_assets").insert(newUploadedAssets);
    if (assetsError) throw new Error(`Failed to create new post assets from uploaded files: ${assetsError.message}`);
  }

  return newPost;
};

export const fetchPostsByStatus = async (
  statuses: string[],
  accountIds?: string[],
  startDate?: string,
  endDate?: string
) => {
  let query = supabase.from("posts").select("*, post_assets(*), tiktok_accounts(*)").in("status", statuses);

  if (accountIds && accountIds.length > 0) {
    query = query.in("tiktok_account_id", accountIds);
  }

  if (startDate && endDate) {
    // Appending T00:00:00 ensures the date is parsed in the local timezone, not UTC.
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59.999`);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    const dateFilters = statuses
      .map((status) => {
        const dateColumn = status === "PUBLISHED" ? "published_at" : "scheduled_at";
        return `and(${dateColumn}.gte.${startISO},${dateColumn}.lte.${endISO},status.eq.${status})`;
      })
      .join(",");

    if (statuses.length > 1) {
      query = query.or(dateFilters);
    } else if (statuses.length === 1) {
      const dateColumn = statuses[0] === "PUBLISHED" ? "published_at" : "scheduled_at";
      query = query.gte(dateColumn, startISO).lte(dateColumn, endISO);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts by status:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const schedulePost = async ({
  postId,
  scheduledAt,
  accountId,
}: {
  postId: string;
  scheduledAt: string;
  accountId: string;
}) => {
  const { error } = await supabase
    .from("posts")
    .update({ status: "SCHEDULED", scheduled_at: scheduledAt, tiktok_account_id: accountId })
    .eq("id", postId);

  if (error) throw error;
};

export const unschedulePost = async (postId: string) => {
  const { error } = await supabase
    .from("posts")
    .update({ status: "DRAFT", scheduled_at: null, tiktok_account_id: null })
    .eq("id", postId);

  if (error) throw error;
};
