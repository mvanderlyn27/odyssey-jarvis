import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";
import { OnboardingData } from "../types";

const updateOnboardingData = async ({
  userId,
  onboardingData,
}: {
  userId: string;
  onboardingData: Partial<OnboardingData>;
}) => {
  const { error } = await supabase.from("profiles").update({ onboarding_data: onboardingData }).eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }
};

export const useUpdateOnboardingData = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (onboardingData: Partial<OnboardingData>) => updateOnboardingData({ userId, onboardingData }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queries.user.account(userId).queryKey,
      });
    },
  });
};
