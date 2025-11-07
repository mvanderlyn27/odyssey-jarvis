import { useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";

export const usePostMutations = () => {
  const queryClient = useQueryClient();

  const invalidatePostsByStatus = (status: string) => {
    queryClient.invalidateQueries({
      queryKey: queries.posts.byStatus(status).queryKey,
    });
  };

  const invalidateAllPostLists = () => {
    queryClient.invalidateQueries({ queryKey: queries.posts.all().queryKey });
  };

  return { invalidatePostsByStatus, invalidateAllPostLists };
};
