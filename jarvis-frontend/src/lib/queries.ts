import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getPost } from "@/features/posts/api";

export const queries = createQueryKeyStore({
  tiktokAccounts: {
    all: () => ["tiktokAccounts"],
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
    all: () => ["posts"],
    detail: (postId: string) => ({
      queryKey: ["post", postId],
      queryFn: () => getPost(postId),
    }),
    drafts: () => ["posts", "drafts"],
    processing: () => ["posts", "processing"],
    published: () => ["posts", "published"],
  },
});
