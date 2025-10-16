import { removeTikTokAccount } from "../../features/tiktok/api";
import { TikTokAccountCard } from "./TikTokAccountCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TikTokAccount } from "@/features/tiktok/types";

interface TikTokAccountListProps {
  accounts: TikTokAccount[];
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onReauthenticate: () => void;
  onSyncVideos: (accountId: string) => void;
}

const TikTokAccountList: React.FC<TikTokAccountListProps> = ({
  accounts,
  isLoading,
  isError,
  error,
  onReauthenticate,
  onSyncVideos,
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
    return <div>Error fetching accounts: {error?.message}</div>;
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
          onRemove={() => handleRemoveAccount(account.id)}
          onReauthenticate={() => onReauthenticate()}
          onSyncVideos={() => onSyncVideos(account.id)}
        />
      ))}
    </div>
  );
};

export default TikTokAccountList;
