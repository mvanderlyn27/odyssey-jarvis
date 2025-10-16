import { useQuery } from "@tanstack/react-query";
import { getPostAnalyticsHistory } from "../api";

export const usePostAnalyticsHistory = (postId: string) => {
  return useQuery({
    queryKey: ["postAnalyticsHistory", postId],
    queryFn: () => getPostAnalyticsHistory(postId),
    enabled: !!postId,
  });
};
