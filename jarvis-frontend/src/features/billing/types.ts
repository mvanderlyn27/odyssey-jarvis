// Defines the feature set for a plan
export interface PlanFeatures {
  analytics_granularity: "raw" | "hourly" | "daily" | "off";
  max_accounts: number;
  video_uploads: boolean;
  data_retention_days: number;
  daily_direct_post_limit: number;
}

// Represents a subscription plan
export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  features: PlanFeatures;
  created_at: string;
}

// Represents a user or organization's subscription
export interface Subscription {
  id: string;
  user_id?: string;
  organization_id?: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due";
  start_date: string;
  end_date?: string;
  created_at: string;
  plans: Plan;
}
