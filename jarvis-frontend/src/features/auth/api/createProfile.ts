import { OnboardingData } from "@/features/onboarding/types";
import { supabase } from "@/lib/supabase/jarvisClient";

interface CreateProfilePayload {
  id: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_data?: OnboardingData;
}

export const createProfile = async (payload: CreateProfilePayload) => {
  const { error } = await supabase.from("profiles").insert(payload);
  if (error) {
    throw new Error(error.message);
  }
};
