import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as jarvisClient } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";
import { useEditPostStore } from "@/store/useEditPostStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useClonePost = () => {
  const queryClient = useQueryClient();
  const clearPost = useEditPostStore((state) => state.clearPost);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await jarvisClient.functions.invoke("clone-post", {
        body: { post_id: postId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queries.posts.byStatus("DRAFT").queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queries.posts.byStatus("DRAFT,SCHEDULED").queryKey,
      });
      clearPost();
      navigate(`/app/posts/${data.post.id}`);
      toast.success("Post cloned successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to clone post: ${error.message}`);
    },
  });
};
