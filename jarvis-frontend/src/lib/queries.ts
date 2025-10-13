import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getDraft } from "@/features/drafts/api";

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
  drafts: {
    all: (userId: string) => ["drafts", userId],
    detail: (draftId: string) => ({
      queryKey: ["draft", draftId],
      queryFn: () => getDraft(draftId),
    }),
  },
});
