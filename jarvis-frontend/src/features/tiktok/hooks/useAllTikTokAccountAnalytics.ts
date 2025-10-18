import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { fetchAllTikTokAccountAnalytics } from "../api";

export const useAllTikTokAccountAnalytics = () => {
  return useQuery({
    ...queries.tiktokAccountAnalytics.all(),
    queryFn: fetchAllTikTokAccountAnalytics,
  });
};
