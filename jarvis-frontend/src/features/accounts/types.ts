import { Subscription } from "@/features/billing/types";

import { OrganizationRole } from "@/features/organization/types";
import { OnboardingData } from "../onboarding/types";

// Represents the user-specific profile data
export interface Profile {
  id: string; // UUID from auth.users
  organization_id?: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_data?: OnboardingData;
  role?: OrganizationRole;
}

export interface UserAccount {
  profile: Profile;
  subscription: Subscription | null;
  posts_today: number;
}
