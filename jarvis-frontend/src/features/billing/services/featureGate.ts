import { useUserPlan } from "@/features/billing/hooks/useUserPlan";
import { useFeatureGateStore } from "@/store/useFeatureGateStore";
import { Plan, Feature } from "@/features/billing/types";

type FeatureCheck = (plan: Plan, currentValue?: number) => boolean;

const featureChecks: Record<Feature, FeatureCheck> = {
  max_accounts: (plan, currentValue = 0) => {
    if (plan.features.max_accounts === -1) return true;
    return currentValue < plan.features.max_accounts;
  },
  max_posts_per_day: (plan, currentValue = 0) => {
    if (plan.features.max_posts_per_day === -1) return true;
    return currentValue < plan.features.max_posts_per_day;
  },
  video_uploads: (plan) => plan.features.video_uploads,
  draft_limit: (plan, currentValue = 0) => {
    if (plan.features.unlimited_drafts) return true;
    return currentValue < plan.features.draft_limit;
  },
};

export const useFeatureGate = () => {
  const { plan, isLoading } = useUserPlan();
  const { openModal } = useFeatureGateStore();

  const hasAccess = (feature: Feature, currentValue?: number): boolean => {
    if (!plan) return false;
    const check = featureChecks[feature];
    return check ? check(plan, currentValue) : false;
  };

  const gate = (feature: Feature, currentValue?: number): boolean => {
    if (isLoading) {
      console.log("Feature Gate: Plan is loading, gating denied.");
      return false;
    }
    console.log("Feature Gate: Checking access for", {
      feature,
      currentValue,
      planName: plan?.name,
      limit: plan?.features[feature],
    });
    const accessible = hasAccess(feature, currentValue);
    console.log("Feature Gate: Access determined as:", accessible);
    if (!accessible) {
      console.log("Feature Gate: Access denied, opening modal.");
      openModal(feature);
    }
    return accessible;
  };

  return { hasAccess, gate, isLoading };
};
