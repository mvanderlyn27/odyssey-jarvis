import { usePosts } from "@/features/posts/hooks/usePosts";
import { Button } from "@/components/ui/button";
import PostList from "@/features/posts/components/PostList";
import { useEditPostStore } from "@/store/useEditPostStore";
import NewPostCard from "@/features/posts/components/NewPostCard";
import ConfigurablePostCard from "@/features/posts/components/ConfigurablePostCard";
import { useNavigate } from "react-router-dom";
import { PostWithAssets } from "@/features/posts/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/RefreshButton";

export const DraftsPage = () => {
  const { data: posts, isLoading, error, refetch } = usePosts({ status: "DRAFT" });
  const { post: postInEdit, isDirty, setPost } = useEditPostStore();
  const navigate = useNavigate();

  const handlePostClick = (post: PostWithAssets) => {
    setPost(post);
    navigate(`/posts/${post.id}`);
  };

  const startItems = [<NewPostCard key="new-post" />];
  if (postInEdit && postInEdit.status === "DRAFT") {
    startItems.push(
      <ConfigurablePostCard
        key={postInEdit.id}
        post={postInEdit}
        variant="draft"
        index={1}
        isDirty={isDirty}
        onClick={() => handlePostClick(postInEdit as PostWithAssets)}
      />
    );
  }

  const filteredPosts = (posts || []).filter((p) => p.id !== postInEdit?.id);

  return (
    <div className="container p-4">
      <PageHeader title="">
        <RefreshButton onClick={() => refetch()} isRefreshing={isLoading} />
      </PageHeader>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error.message}</p>}
      <div className="space-y-8">
        <PostList posts={filteredPosts} startItems={startItems} variant="draft" />
      </div>
    </div>
  );
};

export default DraftsPage;
