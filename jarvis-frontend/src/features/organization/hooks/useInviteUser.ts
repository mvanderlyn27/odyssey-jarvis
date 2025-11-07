import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteUser } from "@/features/organization/api";
import { OrganizationInvite } from "@/features/organization/types";

export const useInviteUser = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteeEmail, role }: { inviteeEmail: string; role: "admin" | "member" }) =>
      inviteUser(organizationId, inviteeEmail, role),
    onSuccess: (data) => {
      // Invalidate and refetch the organization invites query to show the new invite
      queryClient.invalidateQueries({ queryKey: ["organizationInvites", organizationId] });
    },
  });
};
