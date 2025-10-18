import { PostAnalytics } from "../types";

export const getLatestAnalytics = (analytics: PostAnalytics[] | undefined | null): PostAnalytics | null => {
  if (!analytics || analytics.length === 0) {
    return null;
  }

  // Sort by created_at in descending order and return the first element
  return [...analytics].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
};
