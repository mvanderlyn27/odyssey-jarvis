import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";

interface FetchVideoAnalyticsParams {
  accountId: string;
  postIds: string[];
}

export const useFetchVideoAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, postIds }: FetchVideoAnalyticsParams) => {
      if (!accountId || !postIds || postIds.length === 0) {
        return;
      }
      const { error } = await supabase.functions.invoke("tiktok-bulk-video-details", {
        body: { account_id: accountId, post_ids: postIds },
      });
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.posts.all._def });
    },
    onError: (error) => {
      console.error("Error fetching video analytics:", error);
    },
  });
};
