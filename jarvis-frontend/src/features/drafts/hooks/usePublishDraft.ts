import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { queries } from "@/lib/queries";
import { supabase } from "@/lib/supabase/jarvisClient";
import { initiateTikTokPost } from "@/features/tiktok/api";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";

const PROXY_URL = import.meta.env.VITE_PROXY_URL;

export const usePublishDraft = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { data: tikTokAccounts } = useTikTokAccounts();

  return useMutation({
    mutationFn: async ({
      draft,
      accountId,
      title,
      description,
    }: {
      draft: any;
      accountId: string;
      title: string;
      description: string;
    }) => {
      const selectedAccount = tikTokAccounts?.find((acc) => acc.id === accountId);
      if (!selectedAccount) throw new Error("Selected TikTok account not found.");

      const mediaUrls: { video_url?: string; image_urls?: string[] } = {};
      const videoAsset = draft.draft_assets.find((asset: any) => asset.asset_type === "videos");
      const imageAssets = draft.draft_assets.filter((asset: any) => asset.asset_type === "slides");

      if (videoAsset) {
        mediaUrls.video_url = `${PROXY_URL}/${videoAsset.asset_url}`;
      } else if (imageAssets.length > 0) {
        mediaUrls.image_urls = imageAssets.map((asset: any) => `${PROXY_URL}/${asset.asset_url}`);
      } else {
        throw new Error("No valid media assets found for this draft.");
      }

      const postResult = await initiateTikTokPost(
        selectedAccount.access_token,
        accountId,
        mediaUrls,
        title,
        description
      );

      const { error: updateDraftError } = await supabase
        .from("drafts")
        .update({ status: "published" })
        .eq("id", draft.id);
      if (updateDraftError) throw new Error(`Failed to update draft status: ${updateDraftError.message}`);

      const { error: insertPostError } = await supabase.from("published_posts").insert({
        draft_id: draft.id,
        tiktok_account_id: accountId,
        tiktok_publish_id: postResult.publish_id,
      });
      if (insertPostError) throw new Error(`Failed to create published post record: ${insertPostError.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queries.drafts.all(userId!));
    },
    onError: (error) => {
      // TODO: Add user-friendly error feedback
      console.error("Publishing failed:", error.message);
    },
  });
};
