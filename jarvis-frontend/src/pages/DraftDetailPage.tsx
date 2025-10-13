import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo } from "react";
import DraftPublisher from "@/features/drafts/components/DraftPublisher";

const DraftDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: draft,
    isLoading,
    isError,
  } = useQuery({
    ...queries.drafts.detail(id!),
    enabled: !!id,
  });

  const assets = useMemo(() => draft?.draft_assets?.filter(Boolean) || [], [draft]);
  const { signedUrls } = useSignedUrls(assets);

  const renderMedia = () => {
    if (!draft || !draft.draft_assets || draft.draft_assets.length === 0) {
      return <div className="flex items-center justify-center h-full bg-gray-200">No assets</div>;
    }

    const firstAsset = draft.draft_assets[0];
    const url = signedUrls[firstAsset.asset_url];

    if (!url) {
      return <div className="flex items-center justify-center h-full bg-gray-200">Loading...</div>;
    }

    if (firstAsset.asset_type === "slides") {
      return <img src={url} alt={`Draft asset ${firstAsset.id}`} className="w-full h-full object-cover" />;
    } else {
      return <video src={url} className="w-full h-full object-cover" controls />;
    }
  };

  if (isLoading) return <div>Loading draft...</div>;
  if (isError) return <div>Error loading draft.</div>;
  if (!draft) return <div>Draft not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/drafts" className="text-sm text-foreground hover:underline">
          &larr; Back to Drafts
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[9/16]">{renderMedia()}</div>
        </div>
        <div className="md:col-span-2">
          <DraftPublisher draft={draft} />
        </div>
      </div>
    </div>
  );
};

export default DraftDetailPage;
