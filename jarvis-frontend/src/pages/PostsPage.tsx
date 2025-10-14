import { usePosts } from "@/features/posts/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import PostsList from "@/features/posts/components/PostsList";

export const PostsPage = () => {
  const { session } = useAuthStore();
  const { data: posts, isLoading, error, refetch } = usePosts(session?.user?.id || "");

  const draftPosts = posts?.filter((post) => post.status === "DRAFT") || [];
  const failedPosts = posts?.filter((post) => post.status === "FAILED") || [];
  const publishedPosts = posts?.filter((post) => post.status !== "DRAFT" && post.status !== "FAILED") || [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button onClick={() => refetch()}>Refresh</Button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error.message}</p>}

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Drafts</h2>
          <PostsList posts={draftPosts} showNewPostButton={true} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Failed</h2>
          <PostsList posts={failedPosts} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Published</h2>
          <PostsList posts={publishedPosts} />
        </div>
      </div>
    </div>
  );
};
