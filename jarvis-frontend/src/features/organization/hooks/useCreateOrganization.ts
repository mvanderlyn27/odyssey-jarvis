import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "@/features/organization/api";
import { queries } from "@/lib/queries";
import { useUserPlan } from "@/features/billing/hooks/useUserPlan";
import { toast } from "sonner";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const { plan } = useUserPlan();

  return useMutation({
    mutationFn: ({ name }: { name: string }) => {
      if (plan?.name !== "Pro") {
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
