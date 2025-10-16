import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../api";

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};
