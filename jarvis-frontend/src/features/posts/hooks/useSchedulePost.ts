import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { schedulePost } from "../api";
import { toast } from "sonner";
import { useSchedulePageStore } from "@/store/useSchedulePageStore";

export const useSchedulePost = () => {
  const queryClient = useQueryClient();
  const movePostToSchedule = useSchedulePageStore((state) => state.movePostToSchedule);

  return useMutation({
    mutationFn: schedulePost,
    onMutate: async (newPost: { postId: string; scheduledAt: string; accountId: string }) => {
      await queryClient.cancelQueries({ queryKey: queries.posts.all().queryKey });

      const previousPosts = queryClient.getQueryData(queries.posts.all().queryKey);

      movePostToSchedule(newPost.postId, newPost.scheduledAt, newPost.accountId);

      return { previousPosts };
    },
    onSuccess: () => {
      toast.success("Post scheduled successfully!");
    },
    onError: (err: Error, newPost, context) => {
      console.log("new post error", newPost);
      queryClient.setQueryData(queries.posts.all().queryKey, context?.previousPosts);
      toast.error("Error scheduling post: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queries.posts.byStatus("DRAFT,SCHEDULED").queryKey });
    },
  });
};
