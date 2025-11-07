import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "@/features/organization/api";
import { queries } from "@/lib/queries";
import { useUserAccount } from "@/features/accounts/hooks/useUserAccount";
import { toast } from "sonner";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const { data: userAccount } = useUserAccount();

  return useMutation({
    mutationFn: ({ name }: { name: string }) => {
      if (userAccount?.plan?.name !== "Pro") {
        throw new Error("You must be on the Pro plan to create an organization.");
      }
      return createOrganization(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.organization.current().queryKey });
      toast.success("Organization created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
