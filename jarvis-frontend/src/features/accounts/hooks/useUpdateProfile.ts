import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserAccount } from "../api/update-user-account";
import { Profile } from "../types";
import { queries } from "@/lib/queries";
import { useSession } from "@/features/auth/hooks/useSession";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<Profile> }) =>
      updateUserAccount(userId, updates),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queries.user.account(userId).queryKey });
      }
    },
  });
};
