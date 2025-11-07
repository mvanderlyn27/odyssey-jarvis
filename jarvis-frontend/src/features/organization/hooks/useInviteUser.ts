import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteUser } from "@/features/organization/api";

export const useInviteUser = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteeEmail, role }: { inviteeEmail: string; role: "admin" | "member" }) =>
      inviteUser(organizationId, inviteeEmail, role),
    onSuccess: () => {
      // Invalidate and refetch the organization invites query to show the new invite
      queryClient.invalidateQueries({ queryKey: ["organizationInvites", organizationId] });
    },
  });
};
