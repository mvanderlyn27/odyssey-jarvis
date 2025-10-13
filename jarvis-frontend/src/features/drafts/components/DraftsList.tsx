import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDrafts } from "../hooks/useDrafts";
import { Link, useNavigate } from "react-router-dom";
import { useDraftStore } from "@/store/useDraftStore";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDraft } from "../api";
import { useAuthStore } from "@/store/useAuthStore";
import { queries } from "@/lib/queries";

const DraftsList = () => {
  const { data: drafts, isLoading, isError } = useDrafts();
  const assets = useMemo(() => drafts?.map((draft: any) => draft.draft_assets?.[0]).filter(Boolean), [drafts]);
  const { signedUrls } = useSignedUrls(assets);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;
  const { draft: activeDraft, isDirty } = useDraftStore();

  const createDraftMutation = useMutation({
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
    createDraftMutation.mutate();
  };

  const renderThumbnail = (draft: any) => {
    if (!draft.draft_assets || draft.draft_assets.length === 0) {
      return <div className="flex items-center justify-center h-full">No assets</div>;
    }

    const firstAsset = draft.draft_assets[0];
    const url = signedUrls[firstAsset.asset_url];

    if (!url) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (firstAsset.asset_type === "slides") {
      return <img src={url} alt={`Draft asset ${firstAsset.id}`} className="w-full h-full object-cover" />;
    } else {
      return <video src={url} className="w-full h-full object-cover" poster={url} />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Drafts</CardTitle>
        <Button onClick={handleCreateDraft} disabled={createDraftMutation.isPending}>
          {createDraftMutation.isPending ? "Creating..." : "+ New Draft"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading drafts...</p>}
        {isError && <p>Error loading drafts.</p>}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts?.map((draft: any) => (
              <Link to={`/drafts/${draft.id}`} key={draft.id}>
                <Card className="overflow-hidden">
                  <div className="w-full aspect-[9/16] bg-gray-200">{renderThumbnail(draft)}</div>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Draft #{draft.id}
                      {activeDraft?.id === draft.id && isDirty && (
                        <span className="ml-2 text-xs text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full">
                          Unsaved
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            )) || <p>No drafts found.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DraftsList;
