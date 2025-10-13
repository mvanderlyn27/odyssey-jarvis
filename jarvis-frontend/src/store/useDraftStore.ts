import { create } from "zustand";
import { Tables } from "@/lib/supabase/database";
import { Crop } from "react-image-crop";

export type AssetStatus = "existing" | "new" | "modified" | "deleted";

export type DraftAsset = Tables<"draft_assets">;
export type DraftAssetWithStatus = DraftAsset & {
  status: AssetStatus;
  file?: File; // The file to be uploaded (potentially cropped)
  originalFile?: File; // The original file for new assets, used for re-editing
  url: string; // For local previews of the `file`
  crop?: Crop; // The crop parameters
};

export type Draft = Tables<"drafts"> & {
  draft_assets: DraftAssetWithStatus[];
};

type DraftState = {
  draft: Draft | null;
  isDirty: boolean;
  setDraft: (draft: Tables<"drafts"> & { draft_assets: DraftAsset[] }) => void;
  addAsset: (
    asset: Omit<DraftAsset, "id" | "created_at" | "draft_id" | "order" | "url"> & { file: File; id: string }
  ) => void;
  updateAsset: (asset: Partial<DraftAsset> & { id: string; file?: File; crop?: Crop }) => void;
  removeAsset: (assetId: string) => void;
  reorderAssets: (assets: DraftAssetWithStatus[]) => void;
  reset: () => void;
  setDirty: (isDirty: boolean) => void;
};

export const useDraftStore = create<DraftState>()((set) => ({
  draft: null,
  isDirty: false,
  setDirty: (isDirty) => set({ isDirty }),
  setDraft: (draft) =>
    set({
      isDirty: false,
      draft: {
        ...draft,
        draft_assets: draft.draft_assets.map((asset) => ({
          ...asset,
          status: "existing",
          url: asset.asset_url || "",
        })),
      },
    }),
  addAsset: (asset) =>
    set((state) => {
      if (!state.draft) return state;
      const newAsset: DraftAssetWithStatus = {
        ...asset,
        draft_id: state.draft.id,
        order: state.draft.draft_assets.length,
        status: "new",
        created_at: new Date().toISOString(),
        file: asset.file,
        originalFile: asset.file, // Store the original file
        url: URL.createObjectURL(asset.file),
      };
      return {
        isDirty: true,
        draft: {
          ...state.draft,
          draft_assets: [...state.draft.draft_assets, newAsset],
        },
      };
    }),
  updateAsset: (updatedAsset) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        isDirty: true,
        draft: {
          ...state.draft,
          draft_assets: state.draft.draft_assets.map((asset) => {
            if (asset.id !== updatedAsset.id) return asset;

            const isExisting = asset.status === "existing";
            const newStatus = isExisting ? "modified" : asset.status;

            return {
              ...asset,
              ...updatedAsset,
              status: newStatus,
              file: updatedAsset.file || asset.file,
              crop: updatedAsset.crop || asset.crop,
              url: updatedAsset.file ? URL.createObjectURL(updatedAsset.file) : asset.url,
            };
          }),
        },
      };
    }),
  removeAsset: (assetId) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        isDirty: true,
        draft: {
          ...state.draft,
          draft_assets: state.draft.draft_assets
            .map((asset) => {
              if (asset.id !== assetId) return asset;
              if (asset.status === "new") return null; // Remove new assets directly
              return { ...asset, status: "deleted" };
            })
            .filter((asset): asset is DraftAssetWithStatus => asset !== null),
        },
      };
    }),
  reorderAssets: (assets) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        isDirty: true,
        draft: {
          ...state.draft,
          draft_assets: assets.map((asset, index) => ({ ...asset, order: index })),
        },
      };
    }),
  reset: () => set({ draft: null }),
}));
