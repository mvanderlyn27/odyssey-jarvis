import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchPostsByStatus } from "@/features/posts/api";
import { queries } from "@/lib/queries";

export const useInboxPosts = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;

  return useQuery({
    ...queries.posts.byStatus("INBOX"),
    queryFn: () => fetchPostsByStatus(["INBOX"]),
    enabled: !!userId,
  });
};
