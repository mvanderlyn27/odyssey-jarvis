import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unschedulePost } from "../api";
import { toast } from "sonner";
import { queries } from "@/lib/queries";
import { PostWithAssets } from "@/features/scheduling/components/PostCard";

export const useUnschedulePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unschedulePost,
    onSuccess: () => {
      toast.success("Post unscheduled successfully!");
      queryClient.invalidateQueries({ queryKey: queries.posts.all().queryKey });
    },
    onError: (err: Error) => {
      toast.error("Error unscheduling post: " + err.message);
    },
  });
};
