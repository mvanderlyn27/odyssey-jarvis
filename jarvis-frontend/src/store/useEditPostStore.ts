import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Database } from "@/lib/supabase/database";
import { v4 as uuidv4 } from "uuid";

export type PostWithAssets = Database["public"]["Tables"]["posts"]["Row"] & {
  post_assets: DraftAsset[];
};
export type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  post_assets: Asset[];
};
export type DraftAsset = Database["public"]["Tables"]["post_assets"]["Row"];

export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Asset = DraftAsset & {
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
  initialAssets: Asset[];
  setPost: (post: PostWithAssets | null) => void;
  setPostAsSaved: () => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  addAsset: (file: File) => void;
  removeAsset: (assetId: string) => void;
  updateAssetOrder: (assets: Asset[]) => void;
  reorderAssets: (assets: Asset[]) => void;
  updateAssetFile: (
    assetId: string,
    file: File,
    editSettings?: { crop?: CroppedArea; zoom?: number; rotation?: number }
  ) => void;
  setPostAssets: (assets: Asset[]) => void;
  addAssets: (files: File[]) => void;
};

export const useEditPostStore = create(
  persist<EditPostState>(
    (set, get) => ({
      post: null,
      isDirty: false,
      initialAssets: [],
      setPost: (post) => {
        if (post) {
          const assetsWithStatus: Asset[] = post.post_assets.map((asset) => ({
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
          const newAsset: Asset = {
            id: uuidv4(),
            post_id: state.post.id as any,
            asset_url: URL.createObjectURL(file),
            asset_type: file.type.startsWith("video") ? "videos" : "slides",
            order: (state.post.post_assets?.length || 0) + 1,
            created_at: new Date().toISOString(),
            status: "new",
            file,
            originalFile: file,
            blurhash: null,
            thumbnail_path: null,
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
              post_assets: state.post.post_assets.filter((asset) => asset.id !== assetId),
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
                order: index + 1,
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
      setPostAssets: (newAssets) =>
        set((state) => {
          if (!state.post) return {};
          return {
            post: {
              ...state.post,
              post_assets: newAssets,
            },
            isDirty: true,
          };
        }),
      addAssets: (files: File[]) => {
        set((state) => {
          if (!state.post) return {};
          const newAssets: Asset[] = files.map((file, index) => ({
            id: uuidv4(),
            post_id: state.post!.id,
            asset_url: URL.createObjectURL(file),
            asset_type: file.type.startsWith("video") ? "videos" : "slides",
            order: (state.post?.post_assets?.length || 0) + index + 1,
            created_at: new Date().toISOString(),
            status: "new",
            file,
            originalFile: file,
            blurhash: null,
            thumbnail_path: null,
          }));

          return {
            post: {
              ...state.post,
              post_assets: [...(state.post.post_assets || []), ...newAssets],
            },
            isDirty: true,
          };
        });
      },
    }),
    {
      name: "edit-post-storage",
      partialize: (state) => ({
        ...state,
        post: state.post
          ? {
              ...state.post,
              post_assets: state.post.post_assets.map(({ file, originalFile, ...rest }) => rest),
            }
          : null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.post) {
          const validAssets = state.post.post_assets.filter(
            (asset) => asset.asset_url && !asset.asset_url.startsWith("blob:")
          );
          state.post.post_assets = validAssets;
          state.initialAssets = validAssets;
          state.isDirty = false;
        }
      },
    }
  )
);
