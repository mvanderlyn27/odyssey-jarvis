import { useUserSubscription } from "./useUserSubscription";
import { usePlans } from "./usePlans";
import { Plan, PlanFeatures } from "../types";

export const useUserPlan = () => {
  const { data: subscription, isLoading: isSubscriptionLoading } = useUserSubscription();
  const { data: allPlans, isLoading: arePlansLoading } = usePlans();

  const isLoading = isSubscriptionLoading || arePlansLoading;

  if (isLoading) {
    return { plan: null, isLoading: true };
  }

  // If user has a subscription, use that plan
  if (subscription?.plans) {
    const planWithTypedFeatures = {
      ...subscription.plans,
      features: subscription.plans.features as unknown as PlanFeatures,
    } as Plan;
    return { plan: planWithTypedFeatures, isLoading: false };
  }

  // Otherwise, fall back to the free plan
  const freePlan = allPlans?.find((p) => p.price === 0);
  if (freePlan) {
    const planWithTypedFeatures = {
      ...freePlan,
      features: freePlan.features as unknown as PlanFeatures,
    } as Plan;
    return { plan: planWithTypedFeatures, isLoading: false };
  }

  return { plan: null, isLoading: false };
};
