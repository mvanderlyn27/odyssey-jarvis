export type OrganizationRole = "owner" | "member";
export type InviteStatus = "pending" | "accepted" | "declined";

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
  profiles: Profile;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  avatar_url: string;
  role: OrganizationRole;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  invited_by_user_id: string;
  email: string;
  role: OrganizationRole;
  status: InviteStatus;
  created_at: string;
  updated_at: string;
}
