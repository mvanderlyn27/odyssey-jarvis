import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/jarvisClient";

const signedUrlCache = new Map<string, { url: string; expires: number }>();

export const useSignedUrls = (assets: { asset_url: string }[] | undefined) => {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (assets && assets.length > 0) {
      const generateSignedUrls = async () => {
        setIsLoading(true);
        const urls: Record<string, string> = {};
        const now = Date.now();
        const fiveMinutes = 60 * 5;

        for (const asset of assets) {
          const cached = signedUrlCache.get(asset.asset_url);
          if (cached && cached.expires > now) {
            urls[asset.asset_url] = cached.url;
          } else {
            const { data } = await supabase.storage.from("tiktok_assets").createSignedUrl(asset.asset_url, fiveMinutes);
            if (data) {
              urls[asset.asset_url] = data.signedUrl;
              signedUrlCache.set(asset.asset_url, {
                url: data.signedUrl,
                expires: now + fiveMinutes * 1000 - 10000, // 10-second buffer
              });
            }
          }
        }
        setSignedUrls(urls);
        setIsLoading(false);
      };
      generateSignedUrls();
    }
  }, [assets]);

  return { signedUrls, isLoading };
};
