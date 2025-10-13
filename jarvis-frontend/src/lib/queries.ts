import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const queries = createQueryKeyStore({
  tiktokAccounts: {
    all: (userId: string) => ["tiktokAccounts", userId],
  },
  tiktokPosts: {
    all: (accountId: string) => ["tiktokPosts", accountId],
    detail: (postId: string) => ["tiktokPost", postId],
  },
  drafts: {
    all: (userId: string) => ["drafts", userId],
    detail: (draftId: string) => ["draft", draftId],
  },
});
