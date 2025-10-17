import { usePosts } from "@/features/posts/hooks/usePosts";
import { Button } from "@/components/ui/button";
import DraftPostList from "@/features/posts/components/DraftPostList";

export const DraftsPage = () => {
  const { data: posts, isLoading, error, refetch } = usePosts();

  const draftPosts =
    posts
      ?.filter((post) => post.status === "DRAFT" || post.status === "PROCESSING")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Drafts</h1>
        <Button onClick={() => refetch()}>Refresh</Button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error.message}</p>}

      <div className="space-y-8">
        <DraftPostList posts={draftPosts} showNewPostButton={true} />
      </div>
    </div>
  );
};

export default DraftsPage;
