import { useTikTokAccounts, useRefreshTikTokStats } from "../../features/tiktok/hooks/useTikTokAccounts";
import TikTokAccountCard from "./TikTokAccountCard";
import { TikTokAccount } from "@/features/tiktok/types";
import { Skeleton } from "@/components/ui/skeleton";

interface TikTokAccountListProps {
  onReauthenticate: () => void;
}

const TikTokAccountList: React.FC<TikTokAccountListProps> = ({ onReauthenticate }) => {
  const { data: accounts, isLoading, isError, error } = useTikTokAccounts();
  const { mutate: refreshStats } = useRefreshTikTokStats();

  const handleRefresh = (account: TikTokAccount) => {
    refreshStats(account);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching accounts: {error.message}</div>;
  }

  if (!accounts || accounts.length === 0) {
    return <p>No TikTok accounts linked yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <TikTokAccountCard
          key={account.id}
          account={account}
          onReauthenticate={onReauthenticate}
          onRefresh={() => handleRefresh(account)}
        />
      ))}
    </div>
  );
};

export default TikTokAccountList;
