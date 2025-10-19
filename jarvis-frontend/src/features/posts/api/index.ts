import { supabase } from "@/lib/supabase/jarvisClient";
import { Asset } from "../types";

const getFileType = (fileType: string) => {
  if (fileType.startsWith("image/")) return "slides";
  if (fileType.startsWith("video/")) return "videos";
  return "unknown";
};

export const uploadMedia = async (file: File, postId: string) => {
  const fileType = getFileType(file.type);
  if (fileType === "unknown") {
    throw new Error("Unsupported file type.");
  }

  let filePath: string;
  if (fileType === "slides") {
    filePath = `slides/${postId}/${file.name}`;
  } else {
    filePath = `videos/${postId}/${file.name}`;
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

export const updatePostAssets = async (postId: number, assets: { id: string; order: number }[]) => {
  const updates = assets.map((asset, index) => ({
    id: asset.id,
    order: index + 1,
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
    .select("*, post_assets(*), tiktok_accounts(*), post_analytics(*)")
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
    .select("asset_url")
    .eq("post_id", postId);

  if (assetsError) {
    throw new Error(`Failed to fetch assets for post: ${assetsError.message}`);
  }

  if (assets && assets.length > 0) {
    const assetUrls = assets.map((a) => a.asset_url);
    const { error: storageError } = await supabase.storage.from("tiktok_assets").remove(assetUrls);
    if (storageError) {
      throw new Error(`Failed to delete assets from storage: ${storageError.message}`);
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
  order: number;
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
      const uploadedMedia = await uploadMedia(asset.file, postId.toString());
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
      order: index,
    }));

  if (orderedAssets.length > 0) {
    const { data, error } = await supabase.from("post_assets").upsert(orderedAssets).select();
    if (error) throw new Error(error.message);
    return data;
  }

  return [];
};

export const savePostChanges = async (post: any, initialAssets: Asset[]) => {
  if (!post?.id) throw new Error("No post to save");

  const updates: any = {
    title: post.title,
    description: post.description,
  };

  if (post.status === "FAILED") {
    updates.status = "DRAFT";
  }

  const { error: postUpdateError } = await supabase.from("posts").update(updates).eq("id", post.id);
  if (postUpdateError) throw new Error(`Failed to update post: ${postUpdateError.message}`);

  const assets = post.post_assets || [];
  const postId = post.id.toString();

  const deletedAssets = assets.filter((a: Asset) => a.status === "deleted");
  if (deletedAssets.length > 0) {
    const assetUrlsToDelete = deletedAssets.map((a: { asset_url: any }) => a.asset_url).filter(Boolean);
    if (assetUrlsToDelete.length > 0) {
      await supabase.storage.from("tiktok_assets").remove(assetUrlsToDelete as string[]);
    }
    await supabase
      .from("post_assets")
      .delete()
      .in(
        "id",
        deletedAssets.map((a: { id: any }) => a.id)
      );
  }

  const modifiedAssetsWithOldUrls = assets
    .filter((a: Asset) => a.status === "modified" && a.file)
    .map((currentAsset: Asset) => {
      const initialAsset = initialAssets.find((initial) => initial.id === currentAsset.id);
      return initialAsset?.asset_url;
    })
    .filter(Boolean);

  if (modifiedAssetsWithOldUrls.length > 0) {
    await supabase.storage.from("tiktok_assets").remove(modifiedAssetsWithOldUrls as string[]);
  }

  const assetsToUpload = assets.filter((a: Asset) => (a.status === "new" || a.status === "modified") && a.file);
  const uploadPromises = assetsToUpload.map(async (asset: Asset) => {
    const { asset_url, asset_type } = await uploadMedia(asset.file!, postId);
    return { ...asset, asset_url, asset_type };
  });
  const uploadedAssets = await Promise.all(uploadPromises);
  const uploadedAssetsMap = new Map(uploadedAssets.map((a) => [a.id, a]));

  const finalAssets = assets
    .filter((a: Asset) => a.status !== "deleted")
    .map((asset: Asset, index: number) => {
      const uploadedAsset = uploadedAssetsMap.get(asset.id);
      return {
        id: asset.id,
        post_id: post.id,
        asset_url: uploadedAsset ? uploadedAsset.asset_url : asset.asset_url,
        asset_type: uploadedAsset ? uploadedAsset.asset_type : asset.asset_type,
        order: index,
      };
    });

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
      assetsToClone.map(async (asset: Asset, index: number) => {
        const fromPath = asset.asset_url;
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
          order: index,
        };
      })
    );

    const { error: assetsError } = await supabase.from("post_assets").insert(newAssets);
    if (assetsError) throw new Error(`Failed to create new post assets: ${assetsError.message}`);
  }

  if (newFiles && newFiles.length > 0) {
    const uploadPromises = newFiles.map(async (fileData, index) => {
      const { asset_url, asset_type } = await uploadMedia(fileData.file, newPost.id.toString());
      return {
        post_id: newPost.id,
        asset_url,
        asset_type,
        order: (assetsToClone?.length || 0) + index,
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
  let query = supabase
    .from("posts")
    .select("*, post_assets(*), tiktok_accounts(*), post_analytics(*)")
    .in("status", statuses);

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
