import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unschedulePost } from "../api";
import { toast } from "sonner";
import { queries } from "@/lib/queries";
import { Post } from "../types";
import { useSchedulePageStore } from "@/store/useSchedulePageStore";

export const useUnschedulePost = () => {
  const queryClient = useQueryClient();
  const movePostToDrafts = useSchedulePageStore((state) => state.movePostToDrafts);

  return useMutation({
    mutationFn: unschedulePost,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: queries.posts.all().queryKey });

      const previousPosts = queryClient.getQueryData(queries.posts.all().queryKey);

      movePostToDrafts(postId);

      return { previousPosts };
    },
    onSuccess: () => {
      toast.success("Post unscheduled successfully!");
    },
    onError: (err: Error, newPost, context) => {
      queryClient.setQueryData(queries.posts.all().queryKey, context?.previousPosts);
      toast.error("Error unscheduling post: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queries.posts.byStatus("DRAFT,SCHEDULED").queryKey });
    },
  });
};
