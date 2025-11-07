import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useOrganization,
  useOrganizationMembers,
  useOrganizationInvites,
} from "@/features/organization/hooks/useOrganization";
import { useCancelInvite } from "@/features/organization/hooks/useCancelInvite";
import { useInviteUser } from "@/features/organization/hooks/useInviteUser";
import { Skeleton } from "@/components/ui/skeleton";
import CreateOrganizationForm from "./CreateOrganizationForm";
import PaywallGate from "@/features/billing/components/PaywallGate";
import { useUserProfile } from "@/features/accounts/hooks/useUserProfile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrganizationManager: React.FC = () => {
  const { data: organization, isLoading: isLoadingOrganization } = useOrganization();
  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembers(organization?.id);
  const { data: invites, isLoading: isLoadingInvites } = useOrganizationInvites(organization?.id);
  const { data: userProfile } = useUserProfile();
  const cancelInviteMutation = useCancelInvite();
  const inviteUserMutation = useInviteUser(organization?.id || "");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeEmail) return;
    inviteUserMutation.mutate({ inviteeEmail, role });
    setInviteeEmail("");
  };

  const handleCancelInvite = (inviteId: string) => {
    if (window.confirm("Are you sure you want to cancel this invite?")) {
      cancelInviteMutation.mutate(inviteId);
    }
  };

  if (isLoadingOrganization) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Organization Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are not part of an organization. Create one to get started.</p>
          <PaywallGate
            planName="Pro"
            featureName="Organizations"
            trigger={<Button className="mt-4">Create Organization</Button>}>
            <CreateOrganizationForm />
          </PaywallGate>
        </CardContent>
      </Card>
    );
  }

  const isOwner = userProfile?.profile?.role === "owner";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{organization.name}</CardTitle>
        <p className="text-muted-foreground">Manage your organization's members and settings.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Invite New Member</h3>
          <form className="flex gap-2 mt-2" onSubmit={handleInvite}>
            <Input
              type="email"
              placeholder="new.member@example.com"
              className="flex-grow"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
            />
            <Select onValueChange={(value: "admin" | "member") => setRole(value)} defaultValue="member">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Members</h3>
          {isLoadingMembers ? (
            <Skeleton className="h-12 w-full mt-2" />
          ) : (
            <ul className="space-y-2 mt-2">
              {members?.map((member) => (
                <li key={member.id} className="flex justify-between items-center">
                  <span>{member.profiles.full_name}</span>
                  <span className="text-sm text-muted-foreground">{member.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">Pending Invites</h3>
          {isLoadingInvites ? (
            <Skeleton className="h-12 w-full mt-2" />
          ) : (
            <ul className="space-y-2 mt-2">
              {invites
                ?.filter((invite) => invite.status === "pending")
                .map((invite) => (
                  <li key={invite.id} className="flex justify-between items-center">
                    <span>{invite.email}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{invite.status}</span>
                      {isOwner && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelInvite(invite.id)}
                          disabled={cancelInviteMutation.isPending}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationManager;
