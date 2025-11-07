import { supabase } from "@/lib/supabase/jarvisClient";
import { Organization, OrganizationMember, OrganizationInvite } from "@/features/organization/types";

export const createOrganization = async (name: string): Promise<Organization> => {
  const { data, error } = await supabase.rpc("create_organization", { name });
  if (error) throw error;
  return data;
};

export const getOrganization = async (): Promise<Organization | null> => {
  const { data, error } = await supabase.rpc("get_organization");
  if (error) throw error;
  return data;
};

export const getOrganizationMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*, profiles(*)")
    .eq("organization_id", organizationId);
  if (error) throw error;
  return data;
};

export const getOrganizationInvites = async (organizationId: string): Promise<OrganizationInvite[]> => {
  const { data, error } = await supabase.from("organization_invites").select("*").eq("organization_id", organizationId);
  if (error) throw error;
  return data;
};

export const cancelInvite = async (inviteId: string): Promise<void> => {
  const { error } = await supabase.from("organization_invites").delete().eq("id", inviteId);
  if (error) throw error;
};

export const inviteUser = async (
  organizationId: string,
  inviteeEmail: string,
  role: "admin" | "member"
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke("invite-user", {
    body: { organization_id: organizationId, invitee_email: inviteeEmail, role },
  });
  if (error) throw error;
  return data;
};
