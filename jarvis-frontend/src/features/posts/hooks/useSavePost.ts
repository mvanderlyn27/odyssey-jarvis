import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { queries } from "@/lib/queries";
import { savePostChanges } from "../api";
import { Post, useEditPostStore } from "@/store/useEditPostStore";
import { supabase } from "@/lib/supabase/jarvisClient"; // Import supabase client

export const useSavePost = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { initialAssets, setPostAsSaved } = useEditPostStore();

  return useMutation({
    mutationFn: async (post: Post) => {
      if (!post) throw new Error("No post to save.");

      // 1. Identify assets to be deleted
      const assetsToDelete = initialAssets.filter(
        (initialAsset) => !post.post_assets.some((currentAsset) => currentAsset.id === initialAsset.id)
      );

      // 2. Delete assets from storage
      if (assetsToDelete.length > 0) {
        const pathsToDelete = assetsToDelete.map((asset) => {
          // Extract path from URL
          const url = new URL(asset.asset_url);
          return url.pathname.split("/posts/").pop();
        });
        await supabase.storage.from("posts").remove(pathsToDelete as string[]);
      }

      // 3. Call the existing savePostChanges function
      await savePostChanges(post, initialAssets);
      return post;
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
