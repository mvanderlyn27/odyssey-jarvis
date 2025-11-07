import { Database } from "@/lib/supabase/database";
import { supabase } from "@/lib/supabase/jarvisClient";

export type UserSubscription = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  plan: Database["public"]["Tables"]["plans"]["Row"];
  cancel_at_period_end: boolean;
};

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  // 1. Fetch the active subscription
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .in("status", ["trialing", "active"])
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subError) {
    console.error("Error fetching subscription:", subError);
    // A user may not have a subscription, so we don't throw here.
  }

  if (!subscription) {
    return null;
  }

  // 2. Fetch the subscription's plan
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("stripe_price_id", subscription.plan_id)
    .single();

  if (planError) {
    console.error("Error fetching subscription plan:", planError);
    throw new Error(`Failed to fetch subscription plan details: ${planError.message}`);
  }

  if (!plan) {
    console.warn("Subscription plan not found.");
    // Return subscription without a plan if plan is not found
    return {
      ...(subscription as any),
      plan: null,
    };
  }

  return {
    ...subscription,
    plan,
  };
};
