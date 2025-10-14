import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";

const refreshPostStatus = async (publishedPostId: string) => {
  const { error } = await supabase.functions.invoke("tiktok-publish-status", {
    body: { published_post_id: publishedPostId },
  });

  if (error) {
    throw new Error(`Failed to refresh post status: ${error.message}`);
  }
};

export const useRefreshPostStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshPostStatus,
    onMutate: () => {
      toast.loading("Refreshing status...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Post status refreshed!");
      queryClient.invalidateQueries({ queryKey: queries.posts.processing().queryKey });
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.message);
    },
  });
};
