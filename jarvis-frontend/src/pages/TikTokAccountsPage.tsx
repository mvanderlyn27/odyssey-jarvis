import { useState, useMemo, useEffect } from "react";
import TikTokAccountManager, { initiateTikTokAuth } from "../components/tiktok/TikTokAccountManager";
import TikTokAccountList from "../components/tiktok/TikTokAccountList";
import { useAuthStore } from "../store/useAuthStore";
import { useTikTokAccounts } from "../features/tiktok/hooks/useTikTokAccounts";
import { useTikTokBulkStats } from "../features/tiktok/hooks/useTikTokBulkStats";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSyncTikTokVideos } from "../features/tiktok/hooks/useSyncTikTokVideos";

type SortOrder = "creation_date" | "follower_count" | "posts" | "likes";

const TikTokAccountsPage = () => {
  const setTikTokCodeVerifier = useAuthStore((state) => state.setTikTokCodeVerifier);
  const { data: accounts, isLoading: isLoadingAccounts } = useTikTokAccounts();
  const { mutate: fetchBulkStats, isPending: isLoadingStats } = useTikTokBulkStats();
  const [sortOrder, setSortOrder] = useState<SortOrder>("likes");
  const { mutate: syncVideos } = useSyncTikTokVideos();

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      fetchBulkStats(accounts);
    }
  }, [accounts, fetchBulkStats]);

  const sortedAccounts = useMemo(() => {
    const dataToSort = accounts || [];
    const sorted = [...dataToSort];
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
  }, [accounts, sortOrder]);

  const handleReauthenticate = () => {
    initiateTikTokAuth(setTikTokCodeVerifier);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">TikTok Account Management</h1>
      <div className="flex justify-between items-center">
        <TikTokAccountManager />
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
      <TikTokAccountList
        accounts={sortedAccounts}
        isLoading={isLoadingAccounts || isLoadingStats}
        onReauthenticate={handleReauthenticate}
        onSyncVideos={syncVideos}
      />
    </div>
  );
};

export default TikTokAccountsPage;
