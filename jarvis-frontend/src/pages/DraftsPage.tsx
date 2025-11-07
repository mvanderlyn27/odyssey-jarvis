import { usePosts } from "@/features/posts/hooks/usePosts";
import PostList from "@/features/posts/components/PostList";
import { useEditPostStore } from "@/store/useEditPostStore";
import NewPostCard from "@/features/posts/components/NewPostCard";
import ConfigurablePostCard from "@/features/posts/components/ConfigurablePostCard";
import { useNavigate } from "react-router-dom";
import { PostWithAssets } from "@/features/posts/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEffect } from "react";
import { RefreshButton } from "@/components/RefreshButton";
import EmptyState from "@/components/shared/EmptyState";
import { FilePlus2 } from "lucide-react";
import { useFeatureGate } from "@/features/billing/services/featureGate";
import { useUserPlan } from "@/features/billing/hooks/useUserPlan";

export const DraftsPage = () => {
  const { data: posts, isLoading: isLoadingPosts, error, refetch, isFetching } = usePosts({ status: "DRAFT" });
  const { post: postInEdit, isDirty, setPost, createNewPost } = useEditPostStore();
  const navigate = useNavigate();
  const { gate, isLoading: isGateLoading } = useFeatureGate();
  const { plan } = useUserPlan();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (posts && postInEdit) {
      const updatedPostInEdit = posts.find((p) => p.id === postInEdit.id);
      if (updatedPostInEdit) {
        setPost(updatedPostInEdit);
      }
    }
  }, [posts, postInEdit, setPost]);

  const handlePostClick = (post: PostWithAssets) => {
    setPost(post);
    navigate(`/app/posts/${post.id}`);
  };

  const handleNewPost = () => {
    if (gate("draft_limit", posts?.length ?? 0)) {
      if (createNewPost()) {
        navigate("/app/posts/draft");
      }
    }
  };

  const startItems = [<NewPostCard key="new-post" onClick={handleNewPost} disabled={isGateLoading} />];
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

  const showEmptyState = !isLoadingPosts && filteredPosts.length === 0 && startItems.length <= 1;

  const draftLimit = plan?.features?.draft_limit;

  return (
    <div className="p-6">
      <PageHeader>
        <div className="flex items-center gap-4">
          <RefreshButton onClick={() => refetch()} isRefreshing={isFetching} />
          {plan && (
            <div className="text-sm text-muted-foreground">
              Drafts: {posts?.length ?? 0}
              {draftLimit && draftLimit > 0 ? ` / ${draftLimit}` : ""}
            </div>
          )}
        </div>
      </PageHeader>

      {error && <p className="text-red-500">{error.message}</p>}
      <div className="space-y-8 max-w-7xl ">
        {showEmptyState ? (
          <EmptyState
            Icon={FilePlus2}
            title="No Drafts Yet"
            description="You don't have any drafts. Get started by creating a new one."
            actionText="Create New Post"
            onAction={handleNewPost}
          />
        ) : (
          <PostList
            posts={filteredPosts}
            startItems={startItems}
            variant="draft"
            isLoading={isLoadingPosts}
            isFetching={isFetching}
          />
        )}
      </div>
    </div>
  );
};

export default DraftsPage;
