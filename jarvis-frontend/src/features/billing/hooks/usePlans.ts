import { useQuery } from "@tanstack/react-query";
import { getPlans } from "../api/getPlans";
import { queries } from "../../../lib/queries";
import { Plan } from "../types";

const planOrder = ["Free", "Indie", "Pro"];

export const usePlans = () => {
  return useQuery({
    ...queries.plans.all(),
    queryFn: getPlans,
    select: (data: Plan[]) => {
      return data.sort((a, b) => {
        return planOrder.indexOf(a.name) - planOrder.indexOf(b.name);
      });
    },
  });
};
