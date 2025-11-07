import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";
import { SignUpWithPasswordCredentials } from "@supabase/supabase-js";
import { OnboardingData } from "@/features/onboarding/types";

interface SignUpParams {
  credentials: SignUpWithPasswordCredentials;
  onboardingData?: OnboardingData;
}

const createProfile = async (userId: string, email: string, onboardingData?: OnboardingData) => {
  const { error } = await supabase.from("profiles").insert({ id: userId, email, onboarding_data: onboardingData });
  if (error) {
    throw new Error(error.message);
  }
};

const signUp = async ({ credentials, onboardingData }: SignUpParams) => {
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) {
    throw new Error(error.message);
  }
  if (!data.user || !data.user.email) {
    throw new Error("User not found after sign up.");
  }

  const finalOnboardingData = onboardingData
    ? {
        ...onboardingData,
        hasCompletedPurchase: onboardingData.isFreeTier,
      }
    : undefined;

  await createProfile(data.user.id, data.user.email, finalOnboardingData);
  return data;
};

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.invalidateQueries(queries.user.account(data.user.id));
      }
    },
  });
};
