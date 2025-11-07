import { supabase } from "@/lib/supabase/jarvisClient";
import { Profile } from "../types";
import { Organization } from "@/features/organization/types";

// This composite type brings all user-related account info together
export interface UserAccount {
  profile: Profile;
  organization?: Organization;
}

export const getUserAccount = async (userId: string): Promise<UserAccount> => {
  console.log("Attempting to fetch user account for userId:", userId);

  if (!userId) {
    console.error("No user ID provided to getUserAccount.");
    throw new Error("A user ID is required to fetch account details.");
  }

  // 1. Fetch the user's profile
  console.log("Fetching user profile...");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  if (!profile) {
    console.error("User profile not found for userId:", userId);
    throw new Error("User profile not found.");
  }
  console.log("Successfully fetched profile:", profile);

  // 2. If the user belongs to an organization, fetch its details
  let organization: Organization | undefined;
  if (profile.organization_id) {
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .maybeSingle();

    if (orgError) {
      throw new Error(`Failed to fetch organization details: ${orgError.message}`);
    }
    organization = orgData ?? undefined;
  }

  return {
    profile,
    organization,
  };
};
