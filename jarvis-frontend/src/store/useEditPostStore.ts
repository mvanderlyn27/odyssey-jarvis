import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { DraftPost, CroppedArea, PostWithAssets, Asset } from "@/features/posts/types";
import { persist, PersistStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

type EditPostState = {
  post: DraftPost | null;
  isDirty: boolean;
  saving: boolean;
  initialAssets: Asset[];
  setPost: (post: PostWithAssets | null) => void;
  createNewPost: () => boolean;
  confirmDiscardChanges: () => boolean;
  clearPost: () => void;
  deleteUnsavedDraft: () => boolean;
  setCreatedPost: (post: PostWithAssets) => void;
  setPostAsSaved: (post: PostWithAssets) => void;
  setSaving: (saving: boolean) => void;
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
  addAssets: (files: File[], thumbnails?: (File | null)[]) => void;
  replaceAsset: (assetId: string, file: File, thumbnail?: File | null) => void;
};

export const useEditPostStore = create(
  persist<EditPostState>(
    (set, get) => ({
      post: null,
      isDirty: false,
      saving: false,
      initialAssets: [],
      setPost: (post) => {
        if (get().post?.id === post?.id) {
          return;
        }

        if (get().confirmDiscardChanges()) {
          if (post) {
            const sortedAssets = post.post_assets.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            const assetsWithStatus: Asset[] = sortedAssets.map((asset, index) => ({
              ...asset,
              sort_order: asset.sort_order ?? index + 1,
              status: "unchanged",
            }));
            set({
              post: { ...post, post_assets: assetsWithStatus } as DraftPost,
              initialAssets: assetsWithStatus,
              isDirty: false,
            });
          } else {
            set({ post: null, initialAssets: [], isDirty: false });
          }
        }
      },
      createNewPost: () => {
        if (get().confirmDiscardChanges()) {
          const newPost: DraftPost = {
            id: "draft",
            title: "",
            description: "",
            post_assets: [],
            status: "DRAFT",
            created_at: new Date().toISOString(),
          } as any;
          set({
            post: newPost,
            initialAssets: [],
            isDirty: false, // A new post isn't dirty until edited
          });
          return true;
        }
        return false;
      },
      confirmDiscardChanges: () => {
        if (get().isDirty) {
          return window.confirm("You have unsaved changes. Are you sure you want to discard them?");
        }
        return true;
      },
      deleteUnsavedDraft: () => {
        if (window.confirm("Are you sure you want to delete this draft?")) {
          get().clearPost();
          return true;
        }
        return false;
      },
      clearPost: async () => {
        const post = get().post;
        if (post && post.post_assets) {
          await Promise.all(
            post.post_assets.map(async (asset) => {
              await del(`file_${asset.id}`);
              await del(`originalFile_${asset.id}`);
            })
          );
        }
        set({ post: null, initialAssets: [], isDirty: false });
      },
      setCreatedPost: (post) => {
        const sortedAssets = post.post_assets.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const assetsWithStatus: Asset[] = sortedAssets.map((asset, index) => ({
          ...asset,
          sort_order: asset.sort_order ?? index + 1,
          status: "unchanged",
        }));
        set((state) => ({
          post: {
            ...(state.post as DraftPost),
            ...post,
            post_assets: assetsWithStatus,
          },
        }));
      },
      setPostAsSaved: (post) => {
        const sortedAssets = post.post_assets.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const assetsWithStatus: Asset[] = sortedAssets.map((asset, index) => ({
          ...asset,
          sort_order: asset.sort_order ?? index + 1,
          status: "unchanged",
        }));
        set({
          post: { ...post, post_assets: assetsWithStatus } as DraftPost,
          initialAssets: assetsWithStatus,
          isDirty: false,
        });
      },
      setSaving: (saving) => set({ saving }),
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
            sort_order: (state.post.post_assets?.length || 0) + 1,
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

          const assetToRemove = state.post.post_assets.find((asset) => asset.id === assetId);
          if (assetToRemove) {
            del(`file_${assetToRemove.id}`);
            del(`originalFile_${assetToRemove.id}`);
          }

          const newAssets = state.post.post_assets
            .map((asset) => {
              if (asset.id === assetId) {
                // If the asset is new, just remove it.
                if (asset.status === "new") {
                  return null;
                }
                // If it's an existing asset, mark it as deleted.
                return { ...asset, status: "deleted" };
              }
              return asset;
            })
            .filter((asset): asset is Asset => asset !== null);

          return {
            post: {
              ...state.post,
              post_assets: newAssets,
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
      addAssets: (files: File[], thumbnails?: (File | null)[]) => {
        set((state) => {
          if (!state.post) return {};
          const newAssets: Asset[] = files.map((file, index) => {
            const thumbnailFile = thumbnails?.[index];
            return {
              id: uuidv4(),
              post_id: state.post!.id,
              asset_url: URL.createObjectURL(file),
              asset_type: file.type.startsWith("video") ? "videos" : "slides",
              sort_order: (state.post?.post_assets?.length || 0) + index + 1,
              created_at: new Date().toISOString(),
              status: "new",
              file,
              originalFile: file,
              blurhash: null,
              thumbnail_path: thumbnailFile ? "thumb.jpg" : null,
              editSettings: {
                thumbnail: thumbnailFile || undefined,
              },
            };
          });

          return {
            post: {
              ...state.post,
              post_assets: [...(state.post.post_assets || []), ...newAssets],
            },
            isDirty: true,
          };
        });
      },
      replaceAsset: (assetId, file, thumbnail) =>
        set((state) => {
          if (!state.post) return {};
          const updatedAssets = state.post.post_assets.map((asset) => {
            if (asset.id === assetId) {
              return {
                ...asset,
                asset_url: URL.createObjectURL(file),
                status: (asset.status === "new" ? "new" : "modified") as "new" | "modified",
                file,
                originalFile: file,
                thumbnail_path: thumbnail ? "thumb.jpg" : null, // Placeholder
                editSettings: {
                  thumbnail: thumbnail || undefined,
                },
              };
            }
            return asset;
          });
          return {
            post: { ...state.post, post_assets: updatedAssets },
            isDirty: true,
          };
        }),
    }),
    {
      name: "edit-post-storage",
      storage: {
        getItem: async (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;

            const { state, version } = JSON.parse(str);

            const rehydrateAssets = async (assets: Asset[]) => {
              if (!assets) return [];
              return Promise.all(
                assets.map(async (asset) => {
                  const file = await get(`file_${asset.id}`);
                  const originalFile = await get(`originalFile_${asset.id}`);
                  const rehydratedAsset = { ...asset };
                  if (file) rehydratedAsset.file = file as File;
                  if (originalFile) rehydratedAsset.originalFile = originalFile as File;
                  if (rehydratedAsset.file) {
                    rehydratedAsset.asset_url = URL.createObjectURL(rehydratedAsset.file);
                  }
                  return rehydratedAsset;
                })
              );
            };

            const rehydratedPostAssets = state.post ? await rehydrateAssets(state.post.post_assets) : [];
            const rehydratedInitialAssets = await rehydrateAssets(state.initialAssets);

            const rehydratedState = {
              ...state,
              post: state.post
                ? {
                    ...state.post,
                    post_assets: rehydratedPostAssets,
                  }
                : null,
              initialAssets: rehydratedInitialAssets,
              isDirty: false,
            };

            return { state: rehydratedState, version };
          } catch (error) {
            console.error("Failed to rehydrate state:", error);
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: async (name, newValue) => {
          try {
            const { state, version } = newValue;
            const stateToPersist = JSON.parse(JSON.stringify(state));

            const processAssetsForPersistence = async (assets: Asset[]) => {
              if (!assets) return [];
              await Promise.all(
                assets.map(async (asset) => {
                  if (asset.file instanceof File) await set(`file_${asset.id}`, asset.file);
                  if (asset.originalFile instanceof File) await set(`originalFile_${asset.id}`, asset.originalFile);
                })
              );
              return assets.map(({ file, originalFile, ...rest }) => rest);
            };

            if (state.post) {
              stateToPersist.post.post_assets = await processAssetsForPersistence(state.post.post_assets);
            }
            stateToPersist.initialAssets = await processAssetsForPersistence(state.initialAssets);

            localStorage.setItem(name, JSON.stringify({ state: stateToPersist, version }));
          } catch (error) {
            console.error("Failed to persist state:", error);
          }
        },
        removeItem: async (name) => {
          try {
            const str = localStorage.getItem(name);
            if (str) {
              const { state } = JSON.parse(str);
              if (state.post && state.post.post_assets) {
                await Promise.all(state.post.post_assets.map((asset: Asset) => del(`file_${asset.id}`)));
                await Promise.all(state.post.post_assets.map((asset: Asset) => del(`originalFile_${asset.id}`)));
              }
            }
            localStorage.removeItem(name);
          } catch (error) {
            console.error("Failed to remove persisted state:", error);
          }
        },
      } as PersistStorage<EditPostState>,
    }
  )
);
