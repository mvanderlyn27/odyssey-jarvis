import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost as deletePostApi } from "../api";
import { queries } from "@/lib/queries";
import { toast } from "sonner";
import { useEditPostStore } from "@/store/useEditPostStore";
import { PostWithAssets } from "../types";

export const useDeletePost = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  const { clearPost, post } = useEditPostStore();

  return useMutation({
    mutationFn: async (postId: string) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) {
        throw new Error("Delete cancelled");
      }

      if (postId === "draft") {
        clearPost();
      } else {
        await deletePostApi(postId);
      }
      return postId;
    },
    onSuccess: (deletedPostId) => {
      toast.success("Post deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: queries.posts.byStatus("DRAFT").queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queries.posts.byStatus("DRAFT,SCHEDULED").queryKey,
      });

      if (post?.id === deletedPostId) {
        clearPost();
      }

      onSuccessCallback?.();
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};
