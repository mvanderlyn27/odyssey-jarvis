import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import PostsList from "@/features/posts/components/PostsList";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import OverviewCalendar from "../features/overview/components/OverviewCalendar";
import OverviewCalendarSkeleton from "../features/overview/components/OverviewCalendarSkeleton";
import { usePosts } from "../features/posts/hooks/usePosts";

const OverviewPage = () => {
  const { data: posts, isLoading, error, refetch } = usePosts();

  const sortedPosts = useMemo(() => {
    if (!posts) return { readyToPublish: [], published: [], failed: [] };
    const readyToPublish = posts
      .filter((post) => post.status === "INBOX" || post.status === "PROCESSING")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const published = posts
      .filter((post) => post.status === "PUBLISHED")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const failed = posts
      .filter((post) => post.status === "FAILED")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { readyToPublish, published, failed };
  }, [posts]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Overview</h1>
        <Button onClick={() => refetch()}>Refresh</Button>
      </div>
      {isLoading ? <OverviewCalendarSkeleton /> : <OverviewCalendar posts={posts} />}

      <div className="mt-8">
        {error && <p className="text-red-500">{error.message}</p>}
        <Accordion type="single" collapsible className="w-full" defaultValue="ready-to-publish">
          <AccordionItem value="ready-to-publish">
            <AccordionTrigger>Ready to Publish ({sortedPosts.readyToPublish.length})</AccordionTrigger>
            <AccordionContent>
              <PostsList posts={sortedPosts.readyToPublish} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="published">
            <AccordionTrigger>Published ({sortedPosts.published.length})</AccordionTrigger>
            <AccordionContent>
              <PostsList posts={sortedPosts.published} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="failed">
            <AccordionTrigger>Failed ({sortedPosts.failed.length})</AccordionTrigger>
            <AccordionContent>
              <PostsList posts={sortedPosts.failed} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default OverviewPage;
