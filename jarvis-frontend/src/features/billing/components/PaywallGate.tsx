import React from "react";
import { useUserPlan } from "../hooks/useUserPlan";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import UpgradeModalContent from "./UpgradeModalContent";

interface PaywallGateProps {
  planName: string;
  children: React.ReactNode;
  featureName: string;
  trigger: React.ReactNode;
}

const PaywallGate: React.FC<PaywallGateProps> = ({ planName, children, featureName, trigger }) => {
  const { plan } = useUserPlan();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/checkout");
  };

  if (plan?.name === planName) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-lg">{children}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <UpgradeModalContent featureName={featureName} onUpgrade={handleUpgrade} />
      </DialogContent>
    </Dialog>
  );
};

export default PaywallGate;
