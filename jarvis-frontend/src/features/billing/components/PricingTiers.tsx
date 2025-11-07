import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { usePlans } from "../hooks/usePlans";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPlanFeatures } from "../utils/formatPlanFeatures";
import { useUserProfile } from "@/features/accounts/hooks/useUserProfile";

interface PricingTiersProps {
  columns?: 2 | 3;
  currentPlanId?: string;
  onSelectPlan?: (priceId: string) => void;
  showFreeTier?: boolean;
}

const PricingTiers: React.FC<PricingTiersProps> = ({
  columns = 2,
  currentPlanId,
  onSelectPlan,
  showFreeTier = true,
}) => {
  const navigate = useNavigate();
  const { data: plans, isLoading, isError } = usePlans();
  const { data: userProfile } = useUserProfile();

  const gridClass = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  const handleChoosePlan = (priceId: string | null) => {
    if (priceId) {
      if (onSelectPlan) {
        onSelectPlan(priceId);
      } else if (userProfile) {
        navigate(`/checkout?priceId=${priceId}`);
      } else {
        navigate(`/signup?priceId=${priceId}`);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridClass} gap-8`}>
        {[...Array(columns)].map((_, i) => (
          <Card key={i} className="flex flex-col h-full">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-10 w-1/3 mt-2" />
              <Skeleton className="h-5 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <li key={j} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load pricing plans.</div>;
  }

  return (
    <motion.div
      className={`grid ${gridClass} gap-8`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}>
      {plans
        ?.filter((plan) => showFreeTier || plan.price > 0)
        .map((tier) => (
          <motion.div variants={itemVariants} key={tier.name}>
            <Card className={`flex flex-col h-full ${tier.id === currentPlanId ? "border-primary" : ""}`}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-4xl font-bold">
                  ${tier.price}
                  <span className="text-lg font-normal">/mo</span>
                </p>
                <p className="text-muted-foreground">{tier.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {formatPlanFeatures(tier.features).map((feature) => (
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
              <div className="p-6 pt-0">
                <Button
                  className="w-full"
                  onClick={() => handleChoosePlan(tier.id)}
                  disabled={tier.id === currentPlanId || tier.price === 0}>
                  {tier.id === currentPlanId ? "Current Plan" : tier.price === 0 ? "Included" : "Choose Plan"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
    </motion.div>
  );
};

export default PricingTiers;
