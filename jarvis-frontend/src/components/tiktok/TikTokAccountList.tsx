import { removeTikTokAccount } from "../../features/tiktok/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TikTokAccount } from "@/features/tiktok/types";
import { TikTokAccountCard } from "@/features/tiktok/components/TikTokAccountCard";
import EmptyState from "../shared/EmptyState";
import { UserPlus } from "lucide-react";
import { TikTokAccountCardSkeleton } from "@/features/tiktok/components/TikTokAccountCardSkeleton";

interface TikTokAccountListProps {
  accounts: TikTokAccount[];
  isLoading: boolean;
  isFetched: boolean;
  isError?: boolean;
  error?: Error | null;
  onAddAccount: () => void;
  canAddAccount: boolean;
}

const TikTokAccountList: React.FC<TikTokAccountListProps> = ({
  accounts,
  isLoading,
  isFetched,
  isError,
  error,
  onAddAccount,
  canAddAccount,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: removeTikTokAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiktokAccounts"] });
    },
  });

  const handleRemoveAccount = (accountId: string) => {
    mutation.mutate(accountId);
  };

  if (isLoading && !isFetched) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <TikTokAccountCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching accounts: {error?.message}</div>;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        Icon={UserPlus}
        title="No TikTok Accounts"
        description="You haven't linked any TikTok accounts yet. Please add one to get started."
        actionText={canAddAccount ? "Add Account" : "Upgrade to Add More Accounts"}
        onAction={onAddAccount}
      />
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
      {accounts.map((account) => (
        <TikTokAccountCard
          key={account.id}
          account={account}
          onRemove={() => handleRemoveAccount(account.id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default TikTokAccountList;
