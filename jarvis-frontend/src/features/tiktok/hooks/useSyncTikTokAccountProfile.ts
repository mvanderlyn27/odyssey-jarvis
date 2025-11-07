import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase/jarvisClient";
import { queries } from "../../../lib/queries";
import { toast } from "sonner";

export const useSyncTikTokAccountProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      toast.loading("Refreshing account profile...");
      const { data, error } = await supabase.functions.invoke("sync-tiktok-account-profile", {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Account profile refreshed successfully!");
      queryClient.invalidateQueries({ queryKey: queries.tiktokAccounts.all().queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to refresh account profile: ${error.message}`);
    },
  });
};
