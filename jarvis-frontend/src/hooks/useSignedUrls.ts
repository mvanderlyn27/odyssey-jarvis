import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";

export const useSignedUrls = (paths: (string | undefined | null)[]) => {
  const validPaths = paths.filter(Boolean) as string[];

  const { data: signedUrls = {}, isLoading } = useQuery({
    queryKey: ["signedUrls", validPaths],
    queryFn: async () => {
      if (validPaths.length === 0) {
        return {};
      }

      const urls: Record<string, string> = {};
      const fiveMinutes = 60 * 5;

      for (const path of validPaths) {
        const { data } = await supabase.storage.from("tiktok_assets").createSignedUrl(path, fiveMinutes);
        if (data) {
          urls[path] = data.signedUrl;
        }
      }
      return urls;
    },
    staleTime: 1000 * 60 * 4, // 4 minutes
    enabled: validPaths.length > 0,
  });

  return { signedUrls, isLoading };
};
