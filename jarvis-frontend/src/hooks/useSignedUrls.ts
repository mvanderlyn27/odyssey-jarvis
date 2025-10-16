import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";

export const useSignedUrls = (assets: { asset_url: string }[] | undefined) => {
  const assetUrls = assets?.map((a) => a.asset_url) || [];

  const { data: signedUrls = {}, isLoading } = useQuery({
    queryKey: ["signedUrls", assetUrls],
    queryFn: async () => {
      if (!assets || assets.length === 0) {
        return {};
      }

      const urls: Record<string, string> = {};
      const fiveMinutes = 60 * 5;

      for (const asset of assets) {
        const path =
          typeof asset.asset_url === "string" && asset.asset_url.startsWith("tiktok_assets/")
            ? asset.asset_url.replace("tiktok_assets/", "")
            : asset.asset_url;
        const { data } = await supabase.storage.from("tiktok_assets").createSignedUrl(path, fiveMinutes);
        if (data) {
          urls[asset.asset_url] = data.signedUrl;
        }
      }
      return urls;
    },
    staleTime: 1000 * 60 * 4, // 4 minutes
    enabled: !!assets && assets.length > 0,
  });

  return { signedUrls, isLoading };
};
