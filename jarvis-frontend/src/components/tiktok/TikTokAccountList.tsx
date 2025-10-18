import { removeTikTokAccount } from "../../features/tiktok/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TikTokAccount } from "@/features/tiktok/types";
import { TikTokAccountCard } from "@/features/tiktok/components/TikTokAccountCard";

interface TikTokAccountListProps {
  accounts: TikTokAccount[];
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
}

const TikTokAccountList: React.FC<TikTokAccountListProps> = ({ accounts, isLoading, isError, error }) => {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching accounts: {error?.message}</div>;
  }

  if (!accounts || accounts.length === 0) {
    return <p>No TikTok accounts linked yet.</p>;
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
