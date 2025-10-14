import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { fetchPostsByStatus } from "@/features/posts/api";

export const usePosts = (userId: string) => {
  return useQuery({
    ...queries.posts.all(userId),
    queryFn: () => fetchPostsByStatus(userId, ["DRAFT", "FAILED", "PROCESSING", "PUBLISHED"]),
    enabled: !!userId,
  });
};
