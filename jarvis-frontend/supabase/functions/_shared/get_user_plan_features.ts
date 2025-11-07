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

  // First, try to get the user's active subscription directly
  let { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_id, organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  // If no direct subscription, check for an organization-level subscription
  if (!subscription) {
    const { data: profile } = await supabaseAdmin.from("profiles").select("organization_id").eq("id", userId).single();

    if (profile && profile.organization_id) {
      const { data: orgSubscription } = await supabaseAdmin
        .from("subscriptions")
        .select("plan_id, organization_id")
        .eq("organization_id", profile.organization_id)
        .eq("status", "active")
        .maybeSingle();

      if (orgSubscription) {
        subscription = orgSubscription;
      }
    }
  }

  if (!subscription) {
    throw new Error("Could not find an active subscription for the user.");
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
