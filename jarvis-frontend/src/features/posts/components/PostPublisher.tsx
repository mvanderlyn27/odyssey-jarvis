import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import SingleAccountSelector from "@/components/tiktok/SingleAccountSelector";
import { usePublishPost } from "../hooks/usePublishPost";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useUnschedulePost } from "../hooks/useUnschedulePost";
import { useUserPlan } from "@/features/billing/hooks/useUserPlan";
import { useFeatureGate } from "@/features/billing/services/featureGate";
import { Post, PostWithAssets, DraftPost } from "../types";

interface PostPublisherProps {
  posts: PostWithAssets[];
  post: Post | DraftPost | null;
  isDirty: boolean;
}

const PostPublisher = ({ posts, post, isDirty }: PostPublisherProps) => {
  const navigate = useNavigate();
  const { data: tikTokAccounts } = useTikTokAccounts();
  const { plan } = useUserPlan();
  const [accountId, setAccountId] = useState<string | null>(null);
  const publishMutation = usePublishPost(() => navigate("/app/overview"));
  const unscheduleMutation = useUnschedulePost();
  const { gate } = useFeatureGate();

  const features = plan?.features;
  const postLimit = features?.max_posts_per_day ?? 0;
  const postsToday = useMemo(() => {
    if (!posts) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return posts.filter((p) => {
      const publishedDate = new Date(p.published_at!);
      return publishedDate >= today;
    }).length;
  }, [posts]);

  const canPublish = useMemo(() => {
    if (!post || isDirty) return false;
    return post.status === "DRAFT" || post.status === "FAILED" || post.status === "SCHEDULED";
  }, [post, isDirty]);

  const handleAccountChange = useCallback((id: string) => {
    setAccountId(id);
  }, []);

  const handlePublish = () => {
    if (!gate("max_posts_per_day", postsToday)) {
      return;
    }

    const hasUnsavedChanges = post?.post_assets.some((asset) => asset.asset_url?.startsWith("blob:"));
    if (hasUnsavedChanges) {
      alert("You have unsaved changes. Please save the post before publishing.");
      return;
    }

    if (!accountId || !post?.title) {
      alert("Please select an account and provide a title.");
      return;
    }
    publishMutation.mutate({
      post,
      accountId,
      title: post.title,
      description: post.description || "",
      scheduled_at: new Date().toISOString(),
    });
  };

  if (!post) return null;

  const handleUnschedule = () => {
    if (window.confirm("Are you sure you want to unschedule this post?")) {
      unscheduleMutation.mutate(post!.id);
    }
  };

  if (!post) return null;

  const isScheduled = post.status === "SCHEDULED";

  return (
    <Card className={!canPublish ? "bg-gray-100 dark:bg-neutral-700" : ""}>
      <CardHeader>
        <CardTitle className={!canPublish ? "text-muted-foreground" : ""}>Post Publisher</CardTitle>
        {plan && postLimit > 0 && (
          <div className="text-sm text-muted-foreground">
            Today's Posts: {postsToday} / {postLimit}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset disabled={!canPublish || isScheduled} className="space-y-4">
          <div>
            <Label>Publish to Account</Label>
            <SingleAccountSelector accounts={tikTokAccounts || []} onAccountChange={handleAccountChange} />
          </div>
        </fieldset>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 justify-center">
        {isScheduled && post.scheduled_at ? (
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              Scheduled for {new Date(post.scheduled_at).toLocaleString()}
            </p>
            <Button onClick={handleUnschedule} disabled={unscheduleMutation.isPending} variant="outline">
              {unscheduleMutation.isPending ? "Unscheduling..." : "Unschedule"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handlePublish}
            disabled={!canPublish || publishMutation.isPending || !accountId}
            className="px-8 py-4 rounded-full text-xl ">
            {post.status === "PUBLISHED"
              ? "Published"
              : post.status === "FAILED"
              ? "Retry Publish"
              : publishMutation.isPending
              ? "Publishing..."
              : "Publish to TikTok"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostPublisher;
