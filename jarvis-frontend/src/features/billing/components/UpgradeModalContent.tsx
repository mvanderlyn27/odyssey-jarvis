import React from "react";
import PricingTiers from "./PricingTiers";

interface UpgradeModalContentProps {
  featureName?: string;
  currentPlanId?: string;
  onUpgrade?: (priceId: string) => void;
}

const UpgradeModalContent: React.FC<UpgradeModalContentProps> = ({ featureName, currentPlanId, onUpgrade }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
      {featureName && (
        <p className="mb-6">
          The "{featureName}" feature is only available on the Pro plan. Please upgrade to access this feature.
        </p>
      )}
      <p className="mb-6 text-sm text-gray-500">
        If you upgrade, you will be pro-rated for the lower price plan you were using.
      </p>
      <PricingTiers columns={2} currentPlanId={currentPlanId} onSelectPlan={onUpgrade} showFreeTier={false} />
    </div>
  );
};

export default UpgradeModalContent;
