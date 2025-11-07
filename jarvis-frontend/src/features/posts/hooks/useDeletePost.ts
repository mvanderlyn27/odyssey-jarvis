import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePost } from "../api";
import { usePostMutations } from "./usePostMutations";
import { queries } from "@/lib/queries";

export const useDeletePost = () => {
  const { invalidateAllPostLists, invalidatePostsByStatus } = usePostMutations();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await deletePost(postId);
    },
    onSuccess: (data, postId) => {
      toast.success("Post deleted successfully!");
      invalidatePostsByStatus("DRAFT");
      invalidateAllPostLists();
      queryClient.invalidateQueries({ queryKey: queries.post.detail(postId).queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};
