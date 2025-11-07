import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/useSession";
import { getOrganization, getOrganizationMembers, getOrganizationInvites } from "@/features/organization/api";
import { queries } from "@/lib/queries";

export const useOrganization = () => {
  const { data: session } = useSession();

  return useQuery({
    ...queries.organization.detail(session?.user?.id),
    queryFn: () => {
      if (!session?.user) return null;
      return getOrganization();
    },
    enabled: !!session?.user,
  });
};

export const useOrganizationMembers = (organizationId: string | undefined) => {
  return useQuery({
    ...queries.organization.members(organizationId),
    queryFn: () => {
      if (!organizationId) return [];
      return getOrganizationMembers(organizationId);
    },
    enabled: !!organizationId,
  });
};

export const useOrganizationInvites = (organizationId: string | undefined) => {
  return useQuery({
    ...queries.organization.invites(organizationId),
    queryFn: () => {
      if (!organizationId) return [];
      return getOrganizationInvites(organizationId);
    },
    enabled: !!organizationId,
  });
};
