import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as jarvisClient } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";

export const useClonePost = (onSuccess?: (data: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await jarvisClient.functions.invoke("clone-post", {
        body: { post_id: postId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queries.posts.all._def });
      onSuccess?.(data);
    },
  });
};
