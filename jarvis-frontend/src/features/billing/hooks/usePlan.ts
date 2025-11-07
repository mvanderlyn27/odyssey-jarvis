import { useQuery } from "@tanstack/react-query";
import { getPlan } from "../api";
import { queries } from "@/lib/queries";

export const usePlan = (planId: string | undefined) => {
  return useQuery({
    queryKey: queries.plans.detail(planId).queryKey,
    queryFn: () => getPlan(planId!),
    enabled: !!planId,
  });
};
