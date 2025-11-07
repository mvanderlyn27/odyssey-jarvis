import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelInvite } from "@/features/organization/api";

export const useCancelInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationInvites"] });
    },
  });
};
