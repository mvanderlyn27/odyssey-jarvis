import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateOrganization } from "@/features/organization/hooks/useCreateOrganization";

const CreateOrganizationForm: React.FC = () => {
  const [organizationName, setOrganizationName] = useState("");
  const { mutate: createOrganization, isPending } = useCreateOrganization();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organizationName.trim()) {
      createOrganization({ name: organizationName.trim() });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Your Organization's Name"
            className="flex-grow"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !organizationName.trim()}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateOrganizationForm;
