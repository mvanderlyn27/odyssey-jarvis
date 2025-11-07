import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/jarvisClient";
import { usePostMutations } from "./usePostMutations";

export const useUpdatePostStatus = () => {
  const { invalidateAllPostLists, invalidatePostsByStatus } = usePostMutations();

  return useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: string }) => {
      const { error } = await supabase.from("posts").update({ status }).eq("id", postId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (data, { status }) => {
      toast.success("Post status updated.");
      invalidatePostsByStatus(status);
      invalidateAllPostLists();
    },
    onError: (error) => {
      toast.error(`Failed to update post status: ${error.message}`);
    },
  });
};
