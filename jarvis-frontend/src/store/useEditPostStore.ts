import { create } from "zustand";
import { Database } from "@/lib/supabase/database";
import { v4 as uuidv4 } from "uuid";

export type PostWithAssets = Database["public"]["Tables"]["posts"]["Row"] & {
  post_assets: DraftAsset[];
};
export type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  post_assets: DraftAssetWithStatus[];
};
export type DraftAsset = Database["public"]["Tables"]["post_assets"]["Row"];

export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DraftAssetWithStatus = DraftAsset & {
  status: "new" | "deleted" | "modified" | "unchanged";
  file?: File; // The edited blob, if modifications have been made
  originalFile?: File; // The original file, for new or modified assets
  editSettings?: {
    crop?: CroppedArea;
    zoom?: number;
    rotation?: number;
  };
};

type EditPostState = {
  post: Post | null;
  isDirty: boolean;
  initialAssets: DraftAssetWithStatus[];
  setPost: (post: PostWithAssets | null) => void;
  setPostAsSaved: () => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  addAsset: (file: File) => void;
  removeAsset: (assetId: string) => void;
  updateAssetOrder: (assets: DraftAssetWithStatus[]) => void;
  reorderAssets: (assets: DraftAssetWithStatus[]) => void;
  updateAssetFile: (
    assetId: string,
    file: File,
    editSettings?: { crop?: CroppedArea; zoom?: number; rotation?: number }
  ) => void;
  setPostAssets: (assets: DraftAssetWithStatus[]) => void;

  // Image editor state
  editorMode: "add" | "edit";
  editorAssets: DraftAssetWithStatus[];
  currentImageIndex: number;
  isEditorOpen: boolean;
  openEditor: (assets: DraftAssetWithStatus[], mode: "add" | "edit") => void;
  closeEditor: () => void;
  setCurrentImageIndex: (index: number) => void;
  updateEditorAsset: (
    assetId: string,
    file: File,
    editSettings: { crop?: CroppedArea; zoom?: number; rotation?: number }
  ) => void;
  addAssetFromEditor: (asset: DraftAssetWithStatus) => void;
  addPostAssets: (assets: DraftAssetWithStatus[]) => void;
  removeEditorAsset: (assetId: string) => void;
  replaceEditorAsset: (assetId: string, file: File) => void;
};

export const useEditPostStore = create<EditPostState>((set, get) => ({
  post: null,
  isDirty: false,
  initialAssets: [],
  editorAssets: [],
  currentImageIndex: 0,
  isEditorOpen: false,
  editorMode: "add",
  setPost: (post) => {
    if (post) {
      const assetsWithStatus: DraftAssetWithStatus[] = post.post_assets.map((asset) => ({
        ...asset,
        status: "unchanged",
      }));
      set({ post: { ...post, post_assets: assetsWithStatus }, initialAssets: assetsWithStatus, isDirty: false });
    } else {
      set({ post: null, initialAssets: [], isDirty: false });
    }
  },
  setPostAsSaved: () =>
    set((state) => ({
      isDirty: false,
      initialAssets: state.post?.post_assets || [],
    })),
  updateTitle: (title) =>
    set((state) => ({
      post: state.post ? { ...state.post, title } : null,
      isDirty: true,
    })),
  updateDescription: (description) =>
    set((state) => ({
      post: state.post ? { ...state.post, description } : null,
      isDirty: true,
    })),
  addAsset: (file) =>
    set((state) => {
      if (!state.post) return {};
      const newAsset: DraftAssetWithStatus = {
        id: uuidv4(),
        post_id: state.post.id as any,
        asset_url: URL.createObjectURL(file),
        asset_type: file.type.startsWith("video") ? "videos" : "slides",
        order: (state.post.post_assets?.length || 0) + 1,
        created_at: new Date().toISOString(),
        status: "new",
        file,
        originalFile: file,
      };
      return {
        post: {
          ...state.post,
          post_assets: [...(state.post.post_assets || []), newAsset],
        },
        isDirty: true,
      };
    }),
  removeAsset: (assetId) =>
    set((state) => {
      if (!state.post) return {};
      return {
        post: {
          ...state.post,
          post_assets: state.post.post_assets.map((asset) =>
            asset.id === assetId ? { ...asset, status: "deleted" } : asset
          ),
        },
        isDirty: true,
      };
    }),
  updateAssetOrder: (assets) =>
    set((state) => {
      if (!state.post) return {};
      return {
        post: {
          ...state.post,
          post_assets: assets.map((asset, index) => ({
            ...asset,
            sort_order: index + 1,
            status: asset.status === "new" ? "new" : "modified",
          })),
        },
        isDirty: true,
      };
    }),
  reorderAssets: (assets) => {
    get().updateAssetOrder(assets);
  },
  updateAssetFile: (assetId, file, editSettings) =>
    set((state) => {
      if (!state.post) return {};
      return {
        post: {
          ...state.post,
          post_assets: state.post.post_assets.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  asset_url: URL.createObjectURL(file),
                  status: asset.status === "new" ? "new" : "modified",
                  file,
                  editSettings,
                }
              : asset
          ),
        },
        isDirty: true,
      };
    }),
  setPostAssets: (updatedAssets) =>
    set((state) => {
      if (!state.post) return {};

      const assetMap = new Map(updatedAssets.map((asset) => [asset.id, asset]));

      const newPostAssets = state.post.post_assets.map((originalAsset) => {
        // If the asset was updated, use the new object from updatedAssets.
        if (assetMap.has(originalAsset.id)) {
          return assetMap.get(originalAsset.id)!;
        }
        // If the asset was not updated, create a new object clone to ensure reference equality is broken.
        return { ...originalAsset };
      });

      return {
        post: {
          ...state.post,
          post_assets: newPostAssets,
        },
        isDirty: true,
      };
    }),

  // Image editor actions
  openEditor: (assets, mode) =>
    set({ editorAssets: assets, isEditorOpen: true, currentImageIndex: 0, editorMode: mode }),
  closeEditor: () => set({ isEditorOpen: false, editorAssets: [] }),
  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
  updateEditorAsset: (assetId, file, editSettings) =>
    set((state) => {
      const updateAsset = (asset: DraftAssetWithStatus) => {
        if (asset.id === assetId) {
          return {
            ...asset,
            file,
            editSettings,
            asset_url: URL.createObjectURL(file),
            status: asset.status === "new" ? "new" : "modified",
          } as DraftAssetWithStatus;
        }
        return asset;
      };

      const newEditorAssets = state.editorAssets.map(updateAsset);
      const newPostAssets = state.post?.post_assets.map(updateAsset);

      return {
        editorAssets: newEditorAssets,
        post: state.post ? { ...state.post, post_assets: newPostAssets || [] } : null,
        isDirty: true,
      };
    }),
  addAssetFromEditor: (asset) =>
    set((state) => {
      if (!state.post) return {};
      return {
        post: {
          ...state.post,
          post_assets: [...(state.post.post_assets || []), asset],
        },
        isDirty: true,
      };
    }),
  addPostAssets: (assets) =>
    set((state) => {
      if (!state.post) return {};
      return {
        post: {
          ...state.post,
          post_assets: [...state.post.post_assets, ...assets],
        },
        isDirty: true,
      };
    }),
  removeEditorAsset: (assetId) =>
    set((state) => ({
      editorAssets: state.editorAssets.filter((asset) => asset.id !== assetId),
      isDirty: true,
    })),
  replaceEditorAsset: (assetId, file) =>
    set((state) => ({
      editorAssets: state.editorAssets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              file,
              originalFile: file,
              asset_url: URL.createObjectURL(file),
            }
          : asset
      ),
      isDirty: true,
    })),
}));
