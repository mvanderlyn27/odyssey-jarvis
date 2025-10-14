import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import SingleAccountSelector from "@/components/tiktok/SingleAccountSelector";
import { usePublishPost } from "../hooks/usePublishPost";
import { useCallback, useState } from "react";
import { useEditPostStore } from "@/store/useEditPostStore";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const PostPublisher = () => {
  const navigate = useNavigate();
  const { data: tikTokAccounts } = useTikTokAccounts();
  const [accountId, setAccountId] = useState<string | null>(null);
  const publishMutation = usePublishPost(() => navigate("/inbox"));
  const { post, isDirty } = useEditPostStore();

  const canPublish = useMemo(() => {
    if (!post) return false;
    return !isDirty && (post.status === "DRAFT" || post.status === "FAILED");
  }, [post, isDirty]);

  const handleAccountChange = useCallback((id: string) => {
    setAccountId(id);
  }, []);

  const handlePublish = () => {
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
    });
  };

  if (!post) return null;

  return (
    <Card className={!canPublish ? "bg-gray-100" : ""}>
      <CardHeader>
        <CardTitle className={!canPublish ? "text-gray-400" : ""}>Publish Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset disabled={!canPublish} className="space-y-4">
          <div>
            <Label>Publish to Account</Label>
            <SingleAccountSelector accounts={tikTokAccounts || []} onAccountChange={handleAccountChange} />
          </div>
        </fieldset>
      </CardContent>
      <CardFooter className="flex justify-center">
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
      </CardFooter>
    </Card>
  );
};

export default PostPublisher;
