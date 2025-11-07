import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queries } from "@/lib/queries";
import { deletePost } from "../api";

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await deletePost(postId);
    },
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: queries.posts.byStatus("DRAFT").queryKey,
      });
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};
