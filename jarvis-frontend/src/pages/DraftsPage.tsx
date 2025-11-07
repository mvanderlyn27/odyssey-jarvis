import { usePosts } from "@/features/posts/hooks/usePosts";
import PostList from "@/features/posts/components/PostList";
import { useEditPostStore } from "@/store/useEditPostStore";
import NewPostCard from "@/features/posts/components/NewPostCard";
import { useNavigate } from "react-router-dom";
import { PostWithAssets } from "@/features/posts/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/RefreshButton";
import EmptyState from "@/components/shared/EmptyState";
import { FilePlus2 } from "lucide-react";
import { useFeatureGate } from "@/features/billing/services/featureGate";
import { useUserPlan } from "@/features/billing/hooks/useUserPlan";

export const DraftsPage = () => {
  const { data: posts, isLoading: isLoadingPosts, error, refetch, isFetching } = usePosts({ status: "DRAFT" });
  const { createNewPost } = useEditPostStore();
  const navigate = useNavigate();
  const { gate, isLoading: isGateLoading } = useFeatureGate();
  const { plan } = useUserPlan();

  const handleNewPost = () => {
    if (gate("draft_limit", posts?.length ?? 0)) {
      if (createNewPost()) {
        navigate("/app/posts/draft");
      }
    }
  };

  const startItems = [<NewPostCard key="new-post" onClick={handleNewPost} disabled={isGateLoading} />];

  const showEmptyState = !isLoadingPosts && (posts || []).length === 0;

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
          <PostList posts={posts || []} startItems={startItems} variant="draft" isLoading={isLoadingPosts} />
        )}
      </div>
    </div>
  );
};

export default DraftsPage;
