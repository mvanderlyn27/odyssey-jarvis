// Defines the feature set for a plan
export type Feature = "max_accounts" | "max_posts_per_day" | "video_uploads" | "draft_limit";

export interface PlanFeatures {
  analytics_granularity: "hourly" | "daily" | null;
  max_accounts: number;
  video_uploads: boolean;
  unlimited_drafts: boolean;
  draft_limit: number;
  unlimited_posts: boolean;
  max_posts_per_day: number;
  unlimited_post_history: boolean;
}

// Represents a subscription plan
export interface Plan {
  id: string;
  name: string;
  description?: string | null;
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
  status: "active" | "canceled" | "past_due" | "trialing";
  start_date: string;
  end_date?: string;
  created_at: string;
  current_period_ends_at?: string;
  cancel_at_period_end?: boolean;
  ended_at?: string;
}
