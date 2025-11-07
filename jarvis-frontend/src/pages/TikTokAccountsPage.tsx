import { useState, useMemo } from "react";
import TikTokAccountManager from "../components/tiktok/TikTokAccountManager";
import TikTokAccountList from "../components/tiktok/TikTokAccountList";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllTikTokAccountAnalytics } from "../features/tiktok/hooks/useAllTikTokAccountAnalytics";
import { TikTokAccount, TikTokAccountAnalytics } from "../features/tiktok/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRefreshAllAccounts } from "../features/tiktok/hooks/useRefreshAllAccounts";
import { useUserPlan } from "@/features/billing/hooks/useUserPlan";
import { initiateTikTokAuth } from "@/features/tiktok/utils/auth";
import { useFeatureGate } from "@/features/billing/services/featureGate";
import { useNavigate } from "react-router-dom";

type SortOrder = "creation_date" | "follower_count" | "posts" | "likes";

const TikTokAccountsPage = () => {
  const navigate = useNavigate();
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    isFetching: isFetchingAccounts,
    isFetched: isFetchedAccounts,
  } = useTikTokAccounts();
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isFetching: isFetchingAnalytics,
    isFetched: isFetchedAnalytics,
  } = useAllTikTokAccountAnalytics();
  const { plan } = useUserPlan();
  const { refreshAll } = useRefreshAllAccounts();
  const { gate } = useFeatureGate();
  const [sortOrder, setSortOrder] = useState<SortOrder>("likes");

  const maxAccounts = plan?.features?.max_accounts ?? 0;

  const canAddAccount = useMemo(() => {
    if (!plan || !accounts) return false;
    if (plan.features.max_accounts === -1) return true; // Unlimited
    return accounts.length < plan.features.max_accounts;
  }, [plan, accounts]);

  const handleAddAccount = () => {
    if (!gate("max_accounts", accounts?.length ?? 0)) {
      navigate("/app/home");
    } else {
      initiateTikTokAuth();
    }
  };

  const sortedAccounts = useMemo(() => {
    if (!accounts) return [];

    const analyticsMap = analytics
      ? new Map(analytics.map((a: TikTokAccountAnalytics) => [a.account_id, a]))
      : new Map();
    const merged: TikTokAccount[] = accounts.map((acc) => {
      const analyticsData = analyticsMap.get(acc.id) || {};
      return {
        ...acc,
        ...analyticsData,
      };
    });

    const sorted = [...merged];
    switch (sortOrder) {
      case "follower_count":
        return sorted.sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0));
      case "posts":
        return sorted.sort((a, b) => (b.video_count || 0) - (a.video_count || 0));
      case "likes":
        return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      case "creation_date":
      default:
        return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
  }, [accounts, analytics, sortOrder]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">TikTok Account Management</h1>
        {plan && maxAccounts > 0 && (
          <div className="text-sm text-muted-foreground">
            {accounts?.length ?? 0} / {maxAccounts} Accounts
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div>{accounts && accounts.length > 0 && <TikTokAccountManager />}</div>
        {accounts && accounts.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button onClick={refreshAll} disabled={isFetchingAccounts || isFetchingAnalytics}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetchingAccounts || isFetchingAnalytics ? "animate-spin" : ""}`}
              />
              Refresh All
            </Button>
            <Select onValueChange={(value) => setSortOrder(value as SortOrder)} defaultValue={sortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creation_date">Creation Date</SelectItem>
                <SelectItem value="follower_count">Follower Count</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <TikTokAccountList
        accounts={sortedAccounts}
        isLoading={isLoadingAccounts || isLoadingAnalytics}
        isFetched={isFetchedAccounts || isFetchedAnalytics}
        onAddAccount={handleAddAccount}
        canAddAccount={!!canAddAccount}
      />
    </div>
  );
};

export default TikTokAccountsPage;
