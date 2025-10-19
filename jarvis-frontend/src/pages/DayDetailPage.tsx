import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePosts } from "../features/posts/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import PostOverviewList from "@/features/posts/components/PostOverviewList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestAnalytics } from "../features/posts/utils/getLatestAnalytics";

const DayDetailPage = () => {
  const { date } = useParams<{ date: string }>();

  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = usePosts({
    startDate: date,
    endDate: date,
    status: "PUBLISHED,SCHEDULED",
  });

  const displayDate = useMemo(() => {
    if (!date) return new Date();
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [date]);

  const publishedPosts = useMemo(() => {
    const filtered = posts?.filter((post) => post.status === "PUBLISHED") || [];
    return filtered.sort((a, b) => {
      const viewsA = getLatestAnalytics(a.post_analytics)?.views || 0;
      const viewsB = getLatestAnalytics(b.post_analytics)?.views || 0;
      return viewsB - viewsA;
    });
  }, [posts]);

  const scheduledPosts = useMemo(() => {
    return posts?.filter((post) => post.status === "SCHEDULED") || [];
  }, [posts]);

  const kpis = useMemo(() => {
    if (!publishedPosts) return { views: 0, likes: 0, comments: 0, shares: 0 };
    return publishedPosts.reduce(
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
  }, [publishedPosts]);

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-red-600">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <PageHeader title={`Posts for ${displayDate.toDateString()}`} />

      <div className="max-w-[80vw] mx-auto space-y-8">
        {publishedPosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Published Post Stats</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {publishedPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Published Posts</h2>
            <PostOverviewList posts={publishedPosts} />
          </div>
        )}

        {scheduledPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Scheduled Posts</h2>
            <PostOverviewList posts={scheduledPosts} />
          </div>
        )}

        {posts?.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Posts Found</h3>
            <p className="text-muted-foreground mt-2 mb-4">There are no scheduled or published posts for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDetailPage;
