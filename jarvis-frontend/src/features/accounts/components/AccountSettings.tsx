import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/features/accounts/hooks/useUserProfile";
import { useUpdateProfile } from "@/features/accounts/hooks/useUpdateProfile";
import AccountSettingsSkeleton from "./AccountSettingsSkeleton";

const AccountSettings: React.FC = () => {
  const { data: userProfile, isLoading } = useUserProfile();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateProfile();
  const [fullName, setFullName] = useState(userProfile?.profile.full_name || "");

  useEffect(() => {
    if (userProfile?.profile.full_name) {
      setFullName(userProfile.profile.full_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.profile.full_name]);

  const handleSave = () => {
    if (fullName && userProfile?.profile.id) {
      updateUser({ userId: userProfile.profile.id, updates: { full_name: fullName } });
    }
  };

  if (isLoading) {
    return <AccountSettingsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
