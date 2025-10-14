import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost as deletePostApi } from "../api";
import { queries } from "@/lib/queries";
import { toast } from "sonner";

export const useDeletePost = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await deletePostApi(postId);
    },
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: queries.posts.all._def,
      });
      onSuccessCallback?.();
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};
