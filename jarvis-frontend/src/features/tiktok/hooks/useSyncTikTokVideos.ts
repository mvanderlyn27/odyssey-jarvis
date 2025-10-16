import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncTikTokVideos as syncTikTokVideosApi } from "../api";
import { toast } from "sonner";

export const useSyncTikTokVideos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => syncTikTokVideosApi(accountId),
    onMutate: () => {
      toast.loading("Refreshing TikTok videos...");
    },
    onSuccess: () => {
      toast.success("TikTok videos refreshed successfully!");
      queryClient.invalidateQueries({ queryKey: ["tiktokAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(`Failed to refresh TikTok videos: ${error.message}`);
    },
  });
};
