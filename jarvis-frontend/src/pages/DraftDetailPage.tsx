import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { fetchDraft } from "@/features/drafts/hooks/useDrafts";
import { deleteDraft } from "@/features/drafts/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Database } from "@/lib/supabase/database";
import { useSignedUrls } from "@/hooks/useSignedUrls";

type Draft = Database["public"]["Tables"]["drafts"]["Row"] & {
  draft_assets: Database["public"]["Tables"]["draft_assets"]["Row"][];
};

const DraftDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const {
    data: draft,
    isLoading,
    isError,
  } = useQuery<Draft>({
    ...queries.drafts.detail(id!),
    queryFn: () => fetchDraft(id!),
    enabled: !!id,
  });
  const { data: tiktokAccounts } = useTikTokAccounts();
  const { signedUrls } = useSignedUrls(draft?.draft_assets);

  const handlePublish = () => {
    if (!selectedAccount) {
      // TODO: Add user feedback
      return;
    }
    // TODO: Implement publishing logic
    console.log(`Publishing draft ${id} to account ${selectedAccount}`);
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteDraft(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.drafts.all._def });
      navigate("/drafts");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading draft.</div>;
  if (!draft) return <div>Draft not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/drafts" className="text-blue-500 hover:underline mb-4 block">
        &larr; Back to Drafts
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Draft #{draft.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-[300px] mx-auto aspect-[9/16] bg-black rounded-md overflow-hidden">
            {draft.draft_assets?.map((asset: any) => (
              <div key={asset.id} className="w-full h-full">
                {asset.asset_type === "slides" ? (
                  <img
                    src={signedUrls[asset.asset_url]}
                    alt={`Draft asset ${asset.id}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video src={signedUrls[asset.asset_url]} controls className="w-full h-full object-contain" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Select onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select TikTok Account" />
              </SelectTrigger>
              <SelectContent>
                {tiktokAccounts?.map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePublish} disabled={!selectedAccount} className="mt-2">
              Publish to TikTok
            </Button>
            <Button onClick={handleDelete} variant="destructive" className="mt-2 ml-2">
              Delete Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftDetailPage;
