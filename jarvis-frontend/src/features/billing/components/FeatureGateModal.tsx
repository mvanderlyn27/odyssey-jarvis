import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useFeatureGateStore } from "@/store/useFeatureGateStore";
import { useNavigate } from "react-router-dom";
import { Feature } from "../types";
import UpgradeModalContent from "./UpgradeModalContent";
import { useUserPlan } from "../hooks/useUserPlan";

const featureNames: Record<Feature, string> = {
  max_accounts: "Additional Accounts",
  max_posts_per_day: "Higher Post Frequency",
  video_uploads: "Video Uploads",
  draft_limit: "More Drafts",
};

const FeatureGateModal: React.FC = () => {
  const { isModalOpen, feature, closeModal } = useFeatureGateStore();
  const { plan } = useUserPlan();
  const navigate = useNavigate();

  const handleUpgrade = (priceId: string) => {
    closeModal();
    navigate(`/checkout?priceId=${priceId}`);
  };

  if (!feature) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl">
        <UpgradeModalContent featureName={featureNames[feature]} currentPlanId={plan?.id} onUpgrade={handleUpgrade} />
      </DialogContent>
    </Dialog>
  );
};

export default FeatureGateModal;
