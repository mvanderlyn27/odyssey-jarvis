import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const tiktokQueries = createQueryKeyStore({
  accounts: {
    all: (userId: string) => ["tiktokAccounts", userId],
  },
  posts: {
    all: (accountId: string) => ["tiktokPosts", accountId],
    detail: (postId: string) => ["tiktokPost", postId],
  },
});
