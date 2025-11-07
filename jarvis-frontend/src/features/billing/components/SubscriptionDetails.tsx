import React from "react";
import { useUserPlan } from "../hooks/useUserPlan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPlanFeatures } from "../utils/formatPlanFeatures";

const SubscriptionDetails: React.FC = () => {
  const { plan, isLoading } = useUserPlan();

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!plan) {
    return null;
  }

  const features = plan ? formatPlanFeatures(plan.features) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-lg">{plan?.name}</p>
        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetails;
