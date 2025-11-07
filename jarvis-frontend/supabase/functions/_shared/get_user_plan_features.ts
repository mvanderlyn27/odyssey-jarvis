import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

export async function getUserPlanFeatures(userId: string) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Find an active subscription for the user
  const { data: subscription, error: subError } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_id")
    .eq("status", "active")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (subError) {
    console.error("Error fetching subscription:", subError);
    throw new Error("An error occurred while fetching the subscription.");
  }

  if (!subscription) {
    // If no active subscription, default to the "Free" plan
    const { data: freePlan, error: freePlanError } = await supabaseAdmin
      .from("plans")
      .select("features")
      .eq("name", "Free")
      .single();

    if (freePlanError || !freePlan) {
      throw new Error("Could not find the default 'Free' plan.");
    }
    return freePlan.features;
  }

  // Now, get the features of that plan
  const { data: plan, error: planError } = await supabaseAdmin
    .from("plans")
    .select("features")
    .eq("id", subscription.plan_id)
    .single();

  if (planError || !plan) {
    throw new Error("Could not find the subscription plan.");
  }

  return plan.features;
}
