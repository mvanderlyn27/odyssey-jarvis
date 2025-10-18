import { usePost } from "../hooks/usePost";
import { PostAnalytics } from "../types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useFetchVideoAnalytics } from "@/features/analytics/hooks/useFetchVideoAnalytics";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/RefreshButton";
import { useDeletePost } from "../hooks/useDeletePost";
import { useClonePost } from "../hooks/useClonePost";
import PostAssets from "./PostAssets";
import AnalyticsGraph from "@/features/analytics/components/AnalyticsGraph";

const PublishedPostDetails = ({ postId }: { postId: string }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: post, isLoading } = usePost(postId);
  const { mutate: refreshAnalytics, isPending: isRefreshing } = useFetchVideoAnalytics();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost(() => navigate("/posts"));
  const { mutate: clonePost, isPending: isCloning } = useClonePost();
  const analytics =
    post?.post_analytics
      ?.slice()
      .sort(
        (a: PostAnalytics, b: PostAnalytics) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] || {};

  const handleRefresh = () => {
    if (post && post.tiktok_accounts && post.tiktok_accounts.open_id) {
      refreshAnalytics(
        {
          accountId: post.tiktok_accounts.open_id,
          postIds: [post.id],
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
          },
        }
      );
    }
  };

  const handleClonePost = () => {
    if (post) {
      clonePost(post.id, {
        onSuccess: (data) => {
          navigate(`/posts/${data.post.id}`);
        },
      });
    }
  };

  const handleDelete = () => {
    if (post) {
      deletePost(post.id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader title={post.title}>
        <RefreshButton onClick={handleRefresh} isRefreshing={isRefreshing} />
        <Button onClick={handleClonePost} variant="outline" disabled={isCloning}>
          {isCloning ? "Cloning..." : "Clone Post"}
        </Button>
        <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </PageHeader>
      <div className="w-full">
        <PostAssets post={post} viewOnly />
      </div>
      <div className="my-4">
        <Card>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Published: {post.published_at}</p>
            <p>{post.description}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{(analytics.views || 0).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{(analytics.likes || 0).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{(analytics.comments || 0).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Shares</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{(analytics.shares || 0).toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            <AnalyticsGraph postId={postId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublishedPostDetails;
