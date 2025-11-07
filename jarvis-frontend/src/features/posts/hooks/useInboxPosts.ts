import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/useSession";
import { fetchPostsByStatus } from "@/features/posts/api";
import { queries } from "@/lib/queries";

export const useInboxPosts = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    ...queries.posts.byStatus("INBOX"),
    queryFn: () => fetchPostsByStatus(["INBOX"]),
    enabled: !!userId,
  });
};
