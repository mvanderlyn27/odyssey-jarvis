import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/useSession";
import { queries } from "@/lib/queries";
import { fetchPostsByStatus } from "../api";

export const useProcessingPosts = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    ...queries.posts.byStatus("PROCESSING"),
    queryFn: () => fetchPostsByStatus(["PROCESSING", "FAILED"]),
    enabled: !!userId,
  });
};
