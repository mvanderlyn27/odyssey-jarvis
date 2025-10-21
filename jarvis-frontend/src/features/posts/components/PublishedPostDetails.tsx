import { usePost } from "../hooks/usePost";
import { PostAnalytics } from "../types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useRefreshPost } from "../api/refreshPost";
import { useNavigate } from "react-router-dom";
import { queries } from "@/lib/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/RefreshButton";
import { useDeletePost } from "../hooks/useDeletePost";
import { useClonePost } from "../hooks/useClonePost";
import PostDetailAssetList from "./PostDetailAssetList";
import AnalyticsGraph from "@/features/analytics/components/AnalyticsGraph";

const PublishedPostDetails = ({ postId }: { postId: string }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: post, isLoading } = usePost(postId);
  const { mutate: refreshPost, isPending: isRefreshing } = useRefreshPost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost(() => navigate("/posts"));
  const { mutate: clonePost, isPending: isCloning } = useClonePost();
  const analytics =
    post?.post_analytics
      ?.slice()
      .sort(
        (a: PostAnalytics, b: PostAnalytics) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] || {};

  const handleRefresh = () => {
    if (post) {
      refreshPost(post.id, {
        onSuccess: () => {
          queryClient.invalidateQueries(queries.post.detail(postId));
        },
      });
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
    <div className="p-6">
      <div className="w-full">
        <PageHeader title="" status={post.status}>
          <RefreshButton onClick={handleRefresh} isRefreshing={isRefreshing} />
          <Button onClick={handleClonePost} variant="outline" disabled={isCloning}>
            {isCloning ? "Cloning..." : "Clone Post"}
          </Button>
          <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </PageHeader>
        <div className="my-4 mx-auto max-w-[70vw]">
          <PostDetailAssetList post={post} viewOnly />
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-4">
        <div className="my-4">
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 relative p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Post Information</h3>
                <div className="space-y-6">
                  <div>
                    <p className="font-semibold">Title</p>
                    <p>{post.title}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Description</p>
                    <p>{post.description}</p>
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 top-0 h-full flex justify-center items-center ">
                <Separator orientation="vertical" className="h-[90%] " />
              </div>
              <div className="md:pl-6">
                <h3 className="text-lg font-semibold mb-4">Publish Information</h3>
                <div className="space-y-6">
                  {post.tiktok_accounts && (
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarImage src={post.tiktok_accounts.tiktok_avatar_url || ""} />
                        <AvatarFallback>
                          {post.tiktok_accounts.tiktok_display_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p>{post.tiktok_accounts.tiktok_display_name}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Published At</p>
                    <p>{new Date(post.published_at).toLocaleString()}</p>
                  </div>
                  {post.tiktok_embed_url && (
                    <div>
                      <p className="font-semibold">Link</p>
                      <a
                        href={post.tiktok_embed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline">
                        View on TikTok
                      </a>
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
};

export default PublishedPostDetails;
