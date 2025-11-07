import { supabase } from "@/lib/supabase/jarvisClient";

export const getUserSubscription = async (userId: string) => {
  if (!userId) return null;

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("user_id", userId)
    .in("status", ["trialing", "active"])
    .single();

  if (subscriptionError) {
    console.error("Error fetching subscription:", subscriptionError);
    return null;
  }

  return subscription;
};
