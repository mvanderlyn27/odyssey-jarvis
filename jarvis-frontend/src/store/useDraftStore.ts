import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tables } from "@/lib/supabase/database";

export type Draft = Tables<"drafts"> & {
  draft_assets: DraftAsset[];
};
export type DraftAsset = Tables<"draft_assets">;

type DraftState = {
  draft: Draft | null;
  setDraft: (draft: Draft) => void;
  addAsset: (asset: DraftAsset) => void;
  updateAsset: (asset: DraftAsset) => void;
  removeAsset: (assetId: string) => void;
  reorderAssets: (assets: DraftAsset[]) => void;
  reset: () => void;
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      draft: null,
      setDraft: (draft) => set({ draft }),
      addAsset: (asset) =>
        set((state) => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              draft_assets: [...(state.draft.draft_assets || []), asset],
            },
          };
        }),
      updateAsset: (updatedAsset) =>
        set((state) => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              draft_assets: (state.draft.draft_assets || []).map((asset) =>
                asset.id === updatedAsset.id ? updatedAsset : asset
              ),
            },
          };
        }),
      removeAsset: (assetId) =>
        set((state) => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              draft_assets: (state.draft.draft_assets || []).filter((asset) => asset.id !== assetId),
            },
          };
        }),
      reorderAssets: (assets) =>
        set((state) => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              draft_assets: assets,
            },
          };
        }),
      reset: () => set({ draft: null }),
    }),
    {
      name: "draft-storage",
    }
  )
);
