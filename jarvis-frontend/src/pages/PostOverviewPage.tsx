import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSelector from "@/components/tiktok/AccountSelector";
import { useFetchVideoAnalytics } from "@/features/analytics/hooks/useFetchVideoAnalytics";
import { usePosts } from "@/features/posts/hooks/usePosts";
import PostOverviewList from "@/features/posts/components/PostOverviewList";
import { TikTokAccount } from "@/features/tiktok/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";
import { RefreshButton } from "@/components/RefreshButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OverviewCalendar from "@/features/overview/components/OverviewCalendar";
import { Separator } from "@/components/ui/separator";
import { getLatestAnalytics } from "@/features/posts/utils/getLatestAnalytics";

const PostOverviewPage = () => {
  const [selectedAccounts, setSelectedAccounts] = useState<TikTokAccount[]>([]);
  const [sortOption, setSortOption] = useState("published_at-desc");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { data: allPosts, isLoading: isLoadingPosts, refetch, isFetching } = usePosts();
  const { mutate: fetchAnalytics, isPending: isFetchingAnalytics } = useFetchVideoAnalytics();

  const handleSelectionChange = (accounts: TikTokAccount[]) => {
    setSelectedAccounts(accounts);
  };

  const handleRefresh = () => {
    refetch();
    if (filteredPosts && filteredPosts.length > 0) {
      selectedAccounts.forEach((account) => {
        const postIds = filteredPosts.filter((p) => p.tiktok_account_id === account.id).map((p) => p.post_id);
        if (postIds.length > 0) {
          fetchAnalytics({ accountId: account.id, postIds });
        }
      });
    }
  };

  const filteredPosts = useMemo(() => {
    if (selectedAccounts.length === 0) return [];

    let posts = allPosts?.filter((p) => selectedAccounts.some((a) => a.id === p.tiktok_account_id));

    if (dateRange?.from) {
      posts = posts?.filter((p) => {
        if (!p.published_at) return false;
        const publishedAt = new Date(p.published_at);
        const from = new Date(dateRange.from!);
        from.setHours(0, 0, 0, 0);

        if (dateRange.to) {
          const to = new Date(dateRange.to);
          to.setHours(23, 59, 59, 999);
          return publishedAt >= from && publishedAt <= to;
        } else {
          return publishedAt.toDateString() === from.toDateString();
        }
      });
    }

    return posts;
  }, [allPosts, selectedAccounts, dateRange]);

  const sortedPosts = useMemo(() => {
    if (!filteredPosts) return [];
    const [sortBy, sortOrder] = sortOption.split("-");

    return [...filteredPosts].sort((a, b) => {
      let valA, valB;

      if (sortBy === "views" || sortBy === "likes") {
        valA = getLatestAnalytics(a.post_analytics)?.[sortBy] || 0;
        valB = getLatestAnalytics(b.post_analytics)?.[sortBy] || 0;
      } else if (sortBy === "published_at") {
        valA = a.published_at ? new Date(a.published_at).getTime() : 0;
        valB = b.published_at ? new Date(b.published_at).getTime() : 0;
      } else {
        valA = a[sortBy];
        valB = b[sortBy];
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredPosts, sortOption]);

  const posts = sortedPosts?.filter((p) => p.status === "PUBLISHED");
  const failedPosts = sortedPosts?.filter((p) => p.status === "FAILED");

  const kpis = useMemo(() => {
    if (!filteredPosts) return { views: 0, likes: 0, comments: 0, shares: 0 };
    return filteredPosts.reduce(
      (acc, post) => {
        const latestAnalytics = getLatestAnalytics(post.post_analytics);
        if (latestAnalytics) {
          acc.views += latestAnalytics.views || 0;
          acc.likes += latestAnalytics.likes || 0;
          acc.comments += latestAnalytics.comments || 0;
          acc.shares += latestAnalytics.shares || 0;
        }
        return acc;
      },
      { views: 0, likes: 0, comments: 0, shares: 0 }
    );
  }, [filteredPosts]);

  return (
    <div className="space-y-8 p-6">
      <OverviewCalendar />
      <Card>
        <CardHeader>
          <CardTitle>Post List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {selectedAccounts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Views</h3>
                <p>{kpis.views.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Likes</h3>
                <p>{kpis.likes.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Comments</h3>
                <p>{kpis.comments.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Shares</h3>
                <p>{kpis.shares.toLocaleString()}</p>
              </div>
            </div>
          )}
          <div className="flex justify-between items-end">
            <AccountSelector selectedAccounts={selectedAccounts} onSelectionChange={handleSelectionChange} />
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="published">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="published">Published ({posts?.length || 0})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({failedPosts?.length || 0})</TabsTrigger>
          </TabsList>
          <div className="flex flex-col md:flex-row gap-2">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published_at-desc">Newest</SelectItem>
                <SelectItem value="published_at-asc">Oldest</SelectItem>
                <SelectItem value="views-desc">Views (High to Low)</SelectItem>
                <SelectItem value="views-asc">Views (Low to High)</SelectItem>
                <SelectItem value="likes-desc">Likes (High to Low)</SelectItem>
                <SelectItem value="likes-asc">Likes (Low to High)</SelectItem>
              </SelectContent>
            </Select>
            <RefreshButton isRefreshing={isFetching || isFetchingAnalytics} onClick={handleRefresh} />
          </div>
        </div>
        <Separator className="my-4" />
        <TabsContent value="published">
          {isLoadingPosts ? <div>Loading posts...</div> : <PostOverviewList posts={posts || []} />}
        </TabsContent>
        <TabsContent value="failed">
          {isLoadingPosts ? <div>Loading failed posts...</div> : <PostOverviewList posts={failedPosts || []} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostOverviewPage;
