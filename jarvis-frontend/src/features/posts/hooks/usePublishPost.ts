import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queries } from "@/lib/queries";
import { initiateTikTokPost } from "@/features/tiktok/api";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { supabase } from "@/lib/supabase/jarvisClient";

const TIKTOK_MEDIA_URL = "https://media.odysseyfit.app";

export const usePublishPost = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { data: tikTokAccounts } = useTikTokAccounts();

  return useMutation({
    onMutate: () => {
      toast.loading("Publishing post...");
    },
    mutationFn: async ({
      post,
      accountId,
      title,
      description,
    }: {
      post: any;
      accountId: string;
      title: string;
      description: string;
    }) => {
      const selectedAccount = tikTokAccounts?.find((acc) => acc.id === accountId);
      if (!selectedAccount) throw new Error("Selected TikTok account not found.");
      if (!selectedAccount.refresh_token) throw new Error("Refresh token not found for the selected account.");

      const mediaUrls: { video_url?: string; image_urls?: string[] } = {};
      const savedAssets = post.post_assets.filter(
        (asset: any) => asset.asset_url && !asset.asset_url.startsWith("blob:")
      );
      const videoAsset = savedAssets.find((asset: any) => asset.asset_type === "videos");
      const imageAssets = savedAssets.filter((asset: any) => asset.asset_type === "slides");

      if (videoAsset) {
        mediaUrls.video_url = `${TIKTOK_MEDIA_URL}/${videoAsset.asset_url}`;
      } else if (imageAssets.length > 0) {
        mediaUrls.image_urls = imageAssets.map((asset: any) => `${TIKTOK_MEDIA_URL}/${asset.asset_url}`);
      } else {
        throw new Error("No valid media assets found for this post.");
      }

      await initiateTikTokPost(
        selectedAccount.access_token,
        selectedAccount.refresh_token,
        accountId,
        mediaUrls,
        title,
        description,
        post.id
      );

      const { error } = await supabase.from("posts").update({ status: "PROCESSING" }).eq("id", post.id);
      if (error) {
        throw new Error(`Failed to update post status: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Post sent for processing!");
      queryClient.invalidateQueries({ queryKey: queries.posts.byStatus("DRAFT").queryKey });
      queryClient.invalidateQueries({ queryKey: queries.posts.byStatus("PROCESSING").queryKey });
      onSuccess?.();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Failed to publish post: ${error.message}`);
      console.error("Publishing failed:", error.message);
    },
  });
};
