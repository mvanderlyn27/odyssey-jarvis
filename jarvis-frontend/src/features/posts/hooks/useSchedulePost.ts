import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { schedulePost } from "../api";
import { toast } from "sonner";
import { PostWithAssets } from "@/features/scheduling/components/PostCard";

type SchedulePostVariables = {
  postId: string;
  scheduledAt: string;
  accountId: string;
};

export const useSchedulePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schedulePost,
    onSuccess: () => {
      toast.success("Post scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: queries.posts.all().queryKey });
    },
    onError: (err: Error) => {
      toast.error("Error scheduling post: " + err.message);
    },
  });
};
