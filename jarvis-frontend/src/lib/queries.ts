import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const queries = createQueryKeyStore({
  posts: {
    all: () => ["posts"],
    detail: (id: string) => ["posts", id],
    byStatus: (status: string, accountIds?: string[]) => ["posts", { status, accountIds }],
    byStatusWithDateRange: (status: string, accountIds?: string[], startDate?: string, endDate?: string) => [
      "posts",
      { status, accountIds, startDate, endDate },
    ],
  },
  post: {
    detail: (id: string) => ["post", id],
  },
  analytics: {
    dailyKpis: (accountIds: string[], startDate?: string, endDate?: string) => [
      "analytics",
      "dailyKpis",
      accountIds,
      startDate,
      endDate,
    ],
  },
  tiktokAccounts: {
    all: () => ["tiktokAccounts"],
    detail: (id: string) => ["tiktokAccounts", id],
  },
  tiktokAccountAnalytics: {
    all: () => ["tiktokAccountAnalytics"],
    detail: (accountId: string | undefined) => ["tiktokAccountAnalytics", "detail", accountId],
    history: (accountId: string | undefined, granularity?: string, startDate?: Date, endDate?: Date) => [
      "tiktokAccountAnalytics",
      "history",
      accountId,
      granularity,
      startDate,
      endDate,
    ],
  },
  tiktokPosts: {
    all: (accountId: string) => ["tiktokPosts", accountId],
    detail: (postId: string) => ["tiktokPosts", "detail", postId],
  },
  tiktokAggregatedStats: {
    all: (accountIds: string[]) => ["tiktokAggregatedStats", accountIds],
  },
  tiktokVideos: {
    list: (accountId: string) => ["tiktokVideos", accountId],
  },
  organization: {
    current: () => ["organization", "current"],
    detail: (userId: string | undefined) => ["organization", userId],
    members: (organizationId: string | undefined) => ["organizationMembers", organizationId],
    invites: (organizationId: string | undefined) => ["organizationInvites", organizationId],
  },
  admin: {
    dashboardStats: {
      queryKey: ["admin", "dashboardStats"],
    },
  },
  user: {
    account: (userId: string | undefined) => ["user", "account", userId],
    subscription: (userId: string | undefined) => ["user", "subscription", userId],
  },
  plans: {
    all: () => ["plans"],
    detail: (id: string | undefined) => ["plans", id],
  },
  auth: {
    session: () => ["session"],
  },
});
