import { supabase } from "@/lib/supabase/jarvisClient";
import { Profile } from "../types";
import { Organization } from "@/features/organizations/types";
import { Subscription, Plan, PlanFeatures } from "@/features/billing/types";

// This composite type brings all user-related account info together
export interface UserAccount {
  profile: Profile;
  organization?: Organization;
  subscription?: Subscription;
  plan?: Plan;
  features: PlanFeatures;
}

// A default set of features for users without an active subscription (e.g., free tier)
const defaultFeatures: PlanFeatures = {
  analytics_granularity: "off",
  max_accounts: 1,
  video_uploads: false,
  data_retention_days: 7,
  daily_direct_post_limit: 1,
};

export const getUserAccount = async (userId: string): Promise<UserAccount> => {
  if (!userId) {
    throw new Error("A user ID is required to fetch account details.");
  }

  // 1. Fetch the user's profile
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (profileError) {
    throw new Error("Failed to fetch user profile.");
  }

  // 2. Fetch the active subscription (either user's or their organization's)
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .or(`user_id.eq.${userId},organization_id.eq.${profile.organization_id}`)
    .eq("status", "active")
    .single();

  // If there's no subscription, return the profile with default features
  if (subError || !subscription) {
    return { profile, features: defaultFeatures };
  }

  // 3. Fetch the subscription's plan
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", subscription.plan_id)
    .single();

  if (planError || !plan) {
    throw new Error("Failed to fetch subscription plan details.");
  }

  // 4. If the user belongs to an organization, fetch its details
  let organization: Organization | undefined;
  if (profile.organization_id) {
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .single();

    if (orgError) {
      throw new Error("Failed to fetch organization details.");
    }
    organization = orgData;
  }

  return {
    profile,
    organization,
    subscription,
    plan,
    features: plan.features as PlanFeatures,
  };
};
