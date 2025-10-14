import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchPostsByStatus } from "@/features/posts/api";

export const useInboxPosts = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ["posts", "inbox", userId],
    queryFn: () => fetchPostsByStatus(userId!, ["INBOX"]),
    enabled: !!userId,
  });
};
