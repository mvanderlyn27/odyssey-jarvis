import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { queries } from "@/lib/queries";
import { fetchPostsByStatus } from "../api";

export const useProcessingPosts = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;

  return useQuery({
    ...queries.posts.processing(userId!),
    queryFn: () => fetchPostsByStatus(userId!, ["PROCESSING", "FAILED"]),
    enabled: !!userId,
  });
};
