import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDrafts } from "../hooks/useDrafts";
import { Link } from "react-router-dom";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo } from "react";

const DraftsList = () => {
  const { data: drafts, isLoading, isError } = useDrafts();
  const assets = useMemo(() => drafts?.map((draft: any) => draft.draft_assets?.[0]).filter(Boolean), [drafts]);
  const { signedUrls } = useSignedUrls(assets);

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
      <CardHeader>
        <CardTitle>Your Drafts</CardTitle>
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
                    <CardTitle>Draft #{draft.id}</CardTitle>
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
