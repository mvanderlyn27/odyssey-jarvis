import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { fetchPostsByStatus } from "@/features/posts/api";

export const usePosts = ({
  status,
  accountId,
  startDate,
  endDate,
}: { status?: string; accountId?: string | string[]; startDate?: string; endDate?: string } = {}) => {
  const accountIds = accountId ? (Array.isArray(accountId) ? accountId : [accountId]) : undefined;
  const staleTime = 1000 * 60 * 10; // 10 minutes

  if (status) {
    const statuses = status.split(",");
    return useQuery({
      ...queries.posts.byStatus(status, accountIds, startDate, endDate),
      queryFn: () => fetchPostsByStatus(statuses, accountIds, startDate, endDate),
      staleTime,
    });
  }

  return useQuery({
    ...queries.posts.all(),
    queryFn: () =>
      fetchPostsByStatus(
        ["DRAFT", "FAILED", "PROCESSING", "PUBLISHED", "INBOX", "SCHEDULED"],
        accountIds,
        startDate,
        endDate
      ),
    staleTime,
    refetchOnMount: true,
  });
};
