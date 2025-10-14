import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { fetchPostsByStatus } from "@/features/posts/api";

export const usePosts = () => {
  return useQuery({
    ...queries.posts.all(),
    queryFn: () => fetchPostsByStatus(["DRAFT", "FAILED", "PROCESSING", "PUBLISHED", "INBOX"]),
  });
};
