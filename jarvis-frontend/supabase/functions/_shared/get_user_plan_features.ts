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

  // First, get the user's active subscription
  const { data: subscription, error: subError } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_id, organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (subError || !subscription) {
    // It's possible the subscription is tied to an organization, not the user directly.
    // We'll need to handle that logic here or in the calling function.
    // For now, we assume user-based subscriptions.
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
