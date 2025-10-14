import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { queries } from "@/lib/queries";
import { savePostChanges } from "../api";
import { Post, useEditPostStore } from "@/store/useEditPostStore";
import { supabase } from "@/lib/supabase/jarvisClient"; // Import supabase client

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
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { initialAssets, setPostAsSaved } = useEditPostStore();

  return useMutation({
    mutationFn: async (post: Post) => {
      if (!post) throw new Error("No post to save.");

      // 1. Upload new assets and update their URLs
      const updatedAssets = await Promise.all(
        post.post_assets.map(async (asset) => {
          if (asset.status === "new" && asset.file) {
            let fileToUpload = asset.file;
            if (fileToUpload.type.startsWith("image")) {
              try {
                fileToUpload = await resizeImage(fileToUpload);
              } catch (error) {
                console.error("Image processing error:", error);
                throw new Error(`Failed to process image ${asset.file?.name}.`);
              }
            }
            const filePath = `${asset.asset_type}/${post.id}/${asset.id}`;
            const { error } = await supabase.storage.from("tiktok_assets").upload(filePath, fileToUpload);
            if (error) {
              throw new Error(`Failed to upload asset: ${error.message}`);
            }
            const {
              data: { publicUrl },
            } = supabase.storage.from("tiktok_assets").getPublicUrl(filePath);
            return { ...asset, asset_url: publicUrl, file: fileToUpload };
          }
          return asset;
        })
      );

      const updatedPost = { ...post, post_assets: updatedAssets };

      // 2. Identify assets to be deleted
      const assetsToDelete = initialAssets.filter(
        (initialAsset) => !updatedPost.post_assets.some((currentAsset) => currentAsset.id === initialAsset.id)
      );

      // 3. Delete assets from storage and database
      if (assetsToDelete.length > 0) {
        const pathsToDelete = assetsToDelete.map((asset) => `${asset.asset_type}/${post.id}/${asset.id}`);
        if (pathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage.from("tiktok_assets").remove(pathsToDelete);
          if (storageError) {
            // Log the error but don't throw, to allow DB deletion to proceed
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
      await savePostChanges(updatedPost, initialAssets);
      return updatedPost;
    },
    onSuccess: (post) => {
      setPostAsSaved();
      toast.success("Changes saved successfully!");
      queryClient.invalidateQueries({ queryKey: queries.posts.detail(post!.id).queryKey });
      queryClient.invalidateQueries({ queryKey: queries.posts.drafts(userId!).queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to save changes: ${error.message}`);
    },
  });
};
