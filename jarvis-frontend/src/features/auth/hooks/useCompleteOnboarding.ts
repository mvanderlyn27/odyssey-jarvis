import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";
import { useSession } from "@/features/auth/hooks/useSession";

const completeOnboarding = async (userId: string) => {
  const { error } = await supabase.from("profiles").update({ onboarding_status: "complete" }).eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user;

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({
          queryKey: queries.user.account(user.id).queryKey,
        });
      }
    },
  });
};
