import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/features/billing/hooks/useUserPlan";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { initiateTikTokAuth } from "@/features/tiktok/utils/auth";
import { Link } from "react-router-dom";

const TikTokAccountManager = () => {
  const { plan, isLoading: isUserPlanLoading } = useUserPlan();
  const { data: accounts, isLoading: isAccountsLoading } = useTikTokAccounts();

  const isLoading = isUserPlanLoading || isAccountsLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const canAddAccount = plan && accounts && accounts.length < plan.features.max_accounts;

  return (
    <div className="flex justify-end">
      {canAddAccount ? (
        <Button id="link-tiktok-account-button" onClick={() => initiateTikTokAuth()}>
          Link New TikTok Account
        </Button>
      ) : (
        <Button asChild>
          <Link to="/billing">Upgrade to Add More Accounts</Link>
        </Button>
      )}
    </div>
  );
};

export default TikTokAccountManager;
