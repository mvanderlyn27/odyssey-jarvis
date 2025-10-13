import { supabase } from "@/lib/supabase/jarvisClient";

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

  const { data, error } = await supabase.storage
    .from("sb_publishable__ib_NziVEPH0amhf76s29Q_ZACadSO3")
    .upload(filePath, file);

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
  const { data, error } = await supabase.from("draft_assets").insert(asset);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
