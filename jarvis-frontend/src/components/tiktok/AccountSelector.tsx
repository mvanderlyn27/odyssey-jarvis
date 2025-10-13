import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountSelectorProps {
  selectedAccounts: string[];
  onSelectionChange: (selected: string[]) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ selectedAccounts, onSelectionChange }) => {
  const { data: accounts, isLoading } = useTikTokAccounts();

  const handleAccountClick = (accountId: string) => {
    const newSelection = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter((id) => id !== accountId)
      : [...selectedAccounts, accountId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (accounts) {
      onSelectionChange(accounts.map((acc) => acc.id));
    }
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className="flex space-x-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-12 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Button onClick={handleSelectAll}>Select All</Button>
        <Button onClick={handleDeselectAll} variant="outline">
          Deselect All
        </Button>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {accounts?.map((account) => (
          <div
            key={account.id}
            className={`flex flex-col items-center space-y-2 cursor-pointer p-2 rounded-lg ${
              selectedAccounts.includes(account.id) ? "bg-accent" : ""
            }`}
            onClick={() => handleAccountClick(account.id)}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={account.tiktok_avatar_url ?? undefined} />
              <AvatarFallback>{account.tiktok_username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{account.tiktok_display_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSelector;
