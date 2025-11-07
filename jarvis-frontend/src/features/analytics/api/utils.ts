import { supabase } from "@/lib/supabase/jarvisClient";
import { Plan } from "@/features/billing/types";

export const getAnalyticsTableName = (
  baseName: "post_analytics" | "account_analytics",
  plan: Plan | null | undefined
): string => {
  const granularity = plan?.features?.analytics_granularity;
  switch (granularity) {
    case "hourly":
      return `${baseName}_hourly`;
    case "daily":
      return `${baseName}_daily`;
    case "monthly":
      return `${baseName}_monthly`;
    default:
      return `${baseName}_raw`;
  }
};

export const fetchUserPlan = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("user_id", user.id)
    .in("status", ["trialing", "active"])
    .single();

  if (error || !data) {
    console.error("Error fetching user plan:", error);
    return null;
  }

  return data;
};
