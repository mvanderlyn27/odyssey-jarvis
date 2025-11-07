import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { savePostChanges } from "../api";
import { useEditPostStore } from "@/store/useEditPostStore";
import { supabase } from "@/lib/supabase/jarvisClient"; // Import supabase client
import { DraftPost } from "../types";
import { usePostMutations } from "./usePostMutations";
import { queries } from "@/lib/queries";

const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.width === 1080 && img.height === 1920) {
        resolve(file);
        return;
      }

      toast.info(`Image ${file.name} is being resized to 1080x1920.`);

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Could not get canvas context"));
      }
      ctx.drawImage(img, 0, 0, 1080, 1920);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error("Canvas to Blob conversion failed"));
          }
          const resizedFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() });
          resolve(resizedFile);
        },
        file.type,
        0.95
      );
    };
    img.onerror = (err) => reject(err);
    img.src = URL.createObjectURL(file);
  });
};

export const useSavePost = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { initialAssets, setPostAsSaved, setCreatedPost, setSaving, clearPost } = useEditPostStore();
  const { invalidateAllPostLists, invalidatePostsByStatus } = usePostMutations();

  return useMutation({
    mutationFn: async (post: DraftPost) => {
      setSaving(true);
      if (!post) throw new Error("No post to save.");

      let currentPost = { ...post };

      // If the post is new (has no user_id), create it first
      if (!currentPost.user_id) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { id, post_assets, ...postData } = currentPost;
        const { data, error } = await supabase
          .from("posts")
          .insert({
            ...postData,
            title: currentPost.title,
            description: currentPost.description,
            user_id: user.id,
          })
          .select()
          .single();
        if (error) throw new Error(`Failed to create post: ${error.message}`);
        currentPost = { ...data, post_assets };
        setCreatedPost(currentPost as any); // Update the store with the new post, including the ID
      }

      // Pre-calculate all file paths and update asset URLs in one go
      currentPost.post_assets.forEach((asset) => {
        if (asset.status === "new" || asset.status === "modified") {
          asset.asset_url = `${asset.asset_type}/${currentPost.id}/${asset.id}`;
        }
      });

      // 1. Delete old assets if they are being replaced
      await Promise.all(
        currentPost.post_assets.map(async (asset) => {
          if (asset.status === "modified") {
            const originalAsset = initialAssets.find((a) => a.id === asset.id);
            if (originalAsset) {
              const pathsToDelete = [];
              if (originalAsset.asset_url) pathsToDelete.push(originalAsset.asset_url);
              if (originalAsset.thumbnail_path) pathsToDelete.push(originalAsset.thumbnail_path);

              if (pathsToDelete.length > 0) {
                const { error: deleteError } = await supabase.storage.from("tiktok_assets").remove(pathsToDelete);
                if (deleteError) {
                  console.error(`Failed to delete old asset files for ${asset.id}:`, deleteError.message);
                  // Decide if you want to throw an error or just log it
                }
              }
            }
          }
        })
      );

      // 2. Upload new and modified assets
      await Promise.all(
        currentPost.post_assets.map(async (asset) => {
          if ((asset.status === "new" || asset.status === "modified") && asset.file) {
            let fileToUpload = asset.file;
            if (fileToUpload.type.startsWith("image")) {
              try {
                fileToUpload = await resizeImage(fileToUpload);
              } catch (error) {
                console.error("Image processing error:", error);
                throw new Error(`Failed to process image ${asset.file?.name}.`);
              }
            }

            const { error } = await supabase.storage.from("tiktok_assets").upload(asset.asset_url!, fileToUpload);
            if (error) {
              throw new Error(`Failed to upload asset: ${error.message}`);
            }

            if (asset.asset_type === "videos" && asset.editSettings?.thumbnail) {
              const thumbnailFilePath = `thumbnails/${currentPost.id}/${asset.id}.jpg`;
              const { error: thumbnailError } = await supabase.storage
                .from("tiktok_assets")
                .upload(thumbnailFilePath, asset.editSettings.thumbnail);
              if (thumbnailError) {
                console.error("Failed to upload thumbnail:", thumbnailError.message);
              } else {
                asset.thumbnail_path = thumbnailFilePath;
              }
            }
          }
        })
      );

      // Separate assets to delete from the main list
      const assetsToDelete = currentPost.post_assets.filter((asset) => asset.status === "deleted");
      const assetsToKeep = currentPost.post_assets.filter((asset) => asset.status !== "deleted");

      const updatedAssets = assetsToKeep.map(({ file, editSettings, ...assetWithoutFile }) => assetWithoutFile);

      const updatedPost = { ...currentPost, post_assets: updatedAssets };

      // 3. Delete assets from storage and database
      if (assetsToDelete.length > 0) {
        const pathsToDelete = assetsToDelete
          .map((asset) => [asset.asset_url, asset.thumbnail_path])
          .flat()
          .filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage.from("tiktok_assets").remove(pathsToDelete);
          if (storageError) {
            console.error("Failed to delete assets from storage:", storageError.message);
          }
        }

        const assetIdsToDelete = assetsToDelete.map((asset) => asset.id);
        if (assetIdsToDelete.length > 0) {
          const { error: dbError } = await supabase.from("post_assets").delete().in("id", assetIdsToDelete);
          if (dbError) {
            throw new Error(`Failed to delete asset records: ${dbError.message}`);
          }
        }
      }

      // 4. Call the existing savePostChanges function
      await savePostChanges(updatedPost);
      return updatedPost;
    },
    onSuccess: (data, variables) => {
      toast.success("Changes saved successfully!");
      invalidatePostsByStatus("DRAFT");
      invalidateAllPostLists();
      queryClient.invalidateQueries({ queryKey: queries.post.detail(data.id).queryKey });
      setPostAsSaved(data as any);
    },
    onError: (error) => {
      toast.error(`Failed to save changes: ${error.message}`);
    },
    onSettled: () => {
      setSaving(false);
    },
  });
};
