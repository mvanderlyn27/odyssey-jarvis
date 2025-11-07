import { PlanFeatures } from "../types";

export const formatPlanFeatures = (features: PlanFeatures): string[] => {
  const formattedFeatures: string[] = [];

  if (features.max_accounts === -1) {
    formattedFeatures.push("Unlimited accounts");
  } else {
    formattedFeatures.push(`${features.max_accounts} account${features.max_accounts > 1 ? "s" : ""}`);
  }

  if (features.max_posts_per_day === -1) {
    formattedFeatures.push("Unlimited posts per day");
  } else if (features.max_posts_per_day > 0) {
    formattedFeatures.push(`${features.max_posts_per_day} posts per day`);
  }

  if (features.analytics_granularity) {
    formattedFeatures.push(
      `${features.analytics_granularity.charAt(0).toUpperCase() + features.analytics_granularity.slice(1)} analytics`
    );
  }

  if (features.video_uploads) {
    formattedFeatures.push("Video posts");
  }

  if (features.unlimited_drafts) {
    formattedFeatures.push("Unlimited drafts");
  } else if (features.draft_limit > 0) {
    formattedFeatures.push(`${features.draft_limit} drafts`);
  }

  if (features.unlimited_posts) {
    formattedFeatures.push("Unlimited posts");
  }

  if (features.unlimited_post_history) {
    formattedFeatures.push("Unlimited post history");
  }

  return formattedFeatures;
};
