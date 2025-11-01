import { Button } from "@/components/ui/button";
import { useAuthStore } from "../../store/useAuthStore";
import { useUserAccount } from "@/features/accounts/hooks/useUserAccount";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { initiateTikTokAuth } from "@/features/tiktok/utils/auth";
import { Link } from "react-router-dom";

const TikTokAccountManager = () => {
  const setTikTokCodeVerifier = useAuthStore((state) => state.setTikTokCodeVerifier);
  const { data: userAccount, isLoading: isUserAccountLoading } = useUserAccount();
  const { data: accounts, isLoading: isAccountsLoading } = useTikTokAccounts();

  const isLoading = isUserAccountLoading || isAccountsLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const canAddAccount = userAccount && accounts && accounts.length < userAccount.features.max_accounts;

  return (
    <div className="flex justify-end mb-4">
      {canAddAccount ? (
        <Button onClick={() => initiateTikTokAuth(setTikTokCodeVerifier)}>Link New TikTok Account</Button>
      ) : (
        <Button asChild>
          <Link to="/billing">Upgrade to Add More Accounts</Link>
        </Button>
      )}
    </div>
  );
};

export default TikTokAccountManager;
