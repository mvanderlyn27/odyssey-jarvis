import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import SingleAccountSelector from "@/components/tiktok/SingleAccountSelector";
import { usePublishDraft } from "../hooks/usePublishDraft";
import { useEffect, useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { updateDraft } from "../api";
// import { queries } from "@/lib/queries";
// import { useAuthStore } from "@/store/useAuthStore";

const DraftPublisher = ({ draft }: { draft: any }) => {
  const { data: tikTokAccounts } = useTikTokAccounts();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const publishMutation = usePublishDraft();
  // const queryClient = useQueryClient();
  // const session = useAuthStore((state) => state.session);
  // const userId = session?.user?.id;

  useEffect(() => {
    if (draft) {
      setTitle(draft.title || "");
      setDescription(draft.description || "");
    }
  }, [draft]);

  // const saveMutation = useMutation({
  //   mutationFn: () => updateDraft(draft.id, { title, description }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(queries.drafts.detail(draft.id));
  //     queryClient.invalidateQueries(queries.drafts.all(userId!));
  //   },
  // });

  const handlePublish = () => {
    if (!accountId || !title) {
      alert("Please select an account and provide a title.");
      return;
    }
    publishMutation.mutate({ draft, accountId, title, description });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Draft #{draft.id}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`title-${draft.id}`}>Title</Label>
          <Input
            id={`title-${draft.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
          />
        </div>
        <div>
          <Label htmlFor={`description-${draft.id}`}>Description</Label>
          <Input
            id={`description-${draft.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Post Description"
          />
        </div>
        <div>
          <Label>Publish to Account</Label>
          <SingleAccountSelector accounts={tikTokAccounts || []} onAccountChange={(id: string) => setAccountId(id)} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handlePublish}
          disabled={publishMutation.isPending || draft.status !== "draft"}
          className="w-1/2">
          {draft.status === "published"
            ? "Published"
            : publishMutation.isPending
            ? "Publishing..."
            : "Publish to TikTok"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DraftPublisher;
