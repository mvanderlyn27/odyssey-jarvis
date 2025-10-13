import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { createDraft } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useNavigate } from "react-router-dom";

const DraftCreator = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("User not found");
      return createDraft(userId);
    },
    onSuccess: (newDraft) => {
      queryClient.invalidateQueries({ queryKey: queries.drafts.all(userId!).queryKey });
      navigate(`/drafts/${newDraft.id}`);
    },
  });

  const handleCreateDraft = () => {
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Draft</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreateDraft} disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create New Draft"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DraftCreator;
