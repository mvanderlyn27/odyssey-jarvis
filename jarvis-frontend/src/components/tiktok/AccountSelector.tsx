import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TikTokAccount } from "@/features/tiktok/types";
import { useAllTikTokAccountAnalytics } from "@/features/tiktok/hooks/useAllTikTokAccountAnalytics";
import { useEffect, useMemo } from "react";

interface AccountSelectorProps {
  selectedAccounts: TikTokAccount[];
  onSelectionChange: (selected: TikTokAccount[]) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ selectedAccounts, onSelectionChange }) => {
  const { data: accounts, isLoading: isLoadingAccounts } = useTikTokAccounts();
  const { data: analytics, isLoading: isLoadingAnalytics } = useAllTikTokAccountAnalytics();

  useEffect(() => {
    if (accounts) {
      onSelectionChange(accounts);
    }
  }, [accounts]);

  const sortedAccounts = useMemo(() => {
    if (!accounts || !analytics) return [];
    return [...accounts].sort((a, b) => {
      const aViews = analytics.find((an: any) => an.account_id === a.id)?.total_views || 0;
      const bViews = analytics.find((an: any) => an.account_id === b.id)?.total_views || 0;
      return bViews - aViews;
    });
  }, [accounts, analytics]);

  const handleAccountClick = (account: TikTokAccount) => {
    const newSelection = selectedAccounts.some((a) => a.id === account.id)
      ? selectedAccounts.filter((a) => a.id !== account.id)
      : [...selectedAccounts, account];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (sortedAccounts) {
      onSelectionChange(sortedAccounts);
    }
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  if (isLoadingAccounts || isLoadingAnalytics) {
    return (
      <div className="flex space-x-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col space-y-2">
        <Button onClick={handleSelectAll} className="w-full">
          Select All
        </Button>
        <Button onClick={handleDeselectAll} variant="outline" className="w-full">
          Deselect All
        </Button>
      </div>
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {sortedAccounts?.map((account) => (
            <div
              key={account.id}
              className={`flex flex-col items-center space-y-2 cursor-pointer p-2 rounded-lg w-20 ${
                selectedAccounts.some((a) => a.id === account.id) ? "bg-accent" : ""
              }`}
              onClick={() => handleAccountClick(account)}>
              <Avatar className="h-16 w-16">
                <AvatarImage src={account.tiktok_avatar_url ?? undefined} />
                <AvatarFallback>{account.tiktok_username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-center truncate w-full">{account.tiktok_display_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountSelector;
