import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncTikTokVideos as syncTikTokVideosApi } from "../api";
import { toast } from "sonner";
import { queries } from "@/lib/queries";

export const useSyncTikTokVideos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => syncTikTokVideosApi(accountId),
    onMutate: () => {
      toast.loading("Refreshing TikTok videos...");
    },
    onSuccess: (_, accountId) => {
      toast.success("TikTok videos refreshed successfully!");
      queryClient.invalidateQueries({
        queryKey: queries.tiktokAccounts.all().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queries.posts.byStatus("PUBLISHED", [accountId]).queryKey,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh TikTok videos: ${error.message}`);
    },
  });
};
