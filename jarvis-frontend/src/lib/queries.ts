import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getPost } from "@/features/posts/api";

export const queries = createQueryKeyStore({
  tiktokAccounts: {
    all: (userId: string) => ["tiktokAccounts", userId],
  },
  tiktokPosts: {
    all: (accountId: string) => ["tiktokPosts", accountId],
    detail: (postId: string) => ["tiktokPost", postId],
  },
  tiktokAggregatedStats: {
    all: (accountIds: string[]) => ["tiktokAggregatedStats", accountIds],
  },
  tiktokVideos: {
    all: (accountIds: string[]) => ["tiktokVideos", accountIds],
  },
  posts: {
    all: (userId: string) => ["posts", userId],
    detail: (postId: string) => ({
      queryKey: ["post", postId],
      queryFn: () => getPost(postId),
    }),
    drafts: (userId: string) => ["posts", "drafts", userId],
    processing: (userId: string) => ["posts", "processing", userId],
    published: (userId: string) => ["posts", "published", userId],
  },
});
