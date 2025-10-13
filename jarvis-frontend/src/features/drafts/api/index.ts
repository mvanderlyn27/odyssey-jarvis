import { supabase } from "@/lib/supabase/jarvisClient";
import { DraftAssetWithStatus } from "@/store/useDraftStore";

const getFileType = (fileType: string) => {
  if (fileType.startsWith("image/")) return "slides";
  if (fileType.startsWith("video/")) return "videos";
  return "unknown";
};

export const uploadMedia = async (file: File, draftId: string) => {
  const fileType = getFileType(file.type);
  if (fileType === "unknown") {
    throw new Error("Unsupported file type.");
  }

  let filePath: string;
  if (fileType === "slides") {
    filePath = `slides/${draftId}/${file.name}`;
  } else {
    filePath = `videos/${file.name}`;
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

export const createDraft = async (userId: string) => {
  const { data, error } = await supabase.from("drafts").insert({ user_id: userId }).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateDraftAssets = async (draftId: number, assets: { id: string; order: number }[]) => {
  const updates = assets.map((asset, index) => ({
    id: asset.id,
    order: index + 1,
  }));

  const { data, error } = await supabase.from("draft_assets").upsert(updates).eq("draft_id", draftId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getDraft = async (draftId: string) => {
  const { data, error } = await supabase
    .from("drafts")
    .select(
      `
      *,
      draft_assets (*)
    `
    )
    .eq("id", draftId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateDraft = async (draftId: number, updates: { title?: string; description?: string }) => {
  const { data, error } = await supabase.from("drafts").update(updates).eq("id", draftId).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteDraft = async (draftId: string) => {
  const { error } = await supabase.from("drafts").delete().eq("id", draftId);

  if (error) {
    throw new Error(error.message);
  }
};

export const addDraftAsset = async (asset: {
  draft_id: number;
  asset_url: string;
  asset_type: string;
  order: number;
}) => {
  const { data, error } = await supabase.from("draft_assets").insert(asset).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const syncDraftAssets = async (draftId: number, assets: DraftAssetWithStatus[]) => {
  const deletedAssets = assets.filter((asset) => asset.status === "deleted");
  if (deletedAssets.length > 0) {
    const { error } = await supabase
      .from("draft_assets")
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
      const uploadedMedia = await uploadMedia(asset.file, draftId.toString());
      asset.asset_url = uploadedMedia.asset_url;
    }
  }

  const orderedAssets = assets
    .filter((asset) => asset.status !== "deleted")
    .map((asset, index) => ({
      id: asset.id,
      draft_id: draftId,
      asset_url: asset.asset_url,
      asset_type: asset.asset_type,
      order: index,
    }));

  if (orderedAssets.length > 0) {
    const { data, error } = await supabase.from("draft_assets").upsert(orderedAssets).select();
    if (error) throw new Error(error.message);
    return data;
  }

  return [];
};
