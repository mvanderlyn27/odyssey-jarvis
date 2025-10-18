import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase/jarvisClient";
import { queries } from "../../../lib/queries";
import { toast } from "sonner";

export const useSyncTikTokAccountStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      toast.loading("Refreshing account stats...");
      const { data, error } = await supabase.functions.invoke("sync-tiktok-account-stats", {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (variables) => {
      toast.success("Account stats refreshed successfully!");
      queryClient.invalidateQueries({ queryKey: queries.tiktokAccountAnalytics.detail(variables).queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to refresh account stats: ${error.message}`);
    },
  });
};
