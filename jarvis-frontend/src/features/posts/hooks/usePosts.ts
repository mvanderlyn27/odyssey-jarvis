import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { fetchPostsByStatus } from "@/features/posts/api";

export const usePosts = ({ status, accountId }: { status?: string; accountId?: string | string[] } = {}) => {
  const accountIds = accountId ? (Array.isArray(accountId) ? accountId : [accountId]) : undefined;

  if (status) {
    const statuses = status.split(",");
    return useQuery({
      ...queries.posts.byStatus(status, accountIds),
      queryFn: () => fetchPostsByStatus(statuses, accountIds),
    });
  }

  return useQuery({
    ...queries.posts.all(),
    queryFn: () => fetchPostsByStatus(["DRAFT", "FAILED", "PROCESSING", "PUBLISHED", "INBOX"], accountIds),
  });
};
