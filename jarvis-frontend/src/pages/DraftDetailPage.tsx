import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo, useEffect, useState } from "react";
import DraftPublisher from "@/features/drafts/components/DraftPublisher";
import { useDraftStore, DraftAsset } from "@/store/useDraftStore";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
const DndContextTyped = DndContext as any;
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import ImageEditor from "@/features/drafts/components/ImageEditor";
import { uploadMedia, addDraftAsset, updateDraftAssets } from "@/features/drafts/api";

const SortableAsset = ({ asset, url, onClick }: { asset: DraftAsset; url: string; onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full aspect-[9/16] relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full cursor-grab">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
      <div className="w-full h-full" onClick={onClick}>
        {asset.asset_type === "slides" ? (
          <img src={url} alt={`Draft asset ${asset.id}`} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <video src={url} className="w-full h-full object-cover rounded-lg" controls />
        )}
      </div>
    </div>
  );
};

const DraftDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { draft, setDraft, reorderAssets, updateAsset, addAsset: addAssetToStore } = useDraftStore();
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingAsset, setEditingAsset] = useState<DraftAsset | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);

  const {
    data: initialDraft,
    isLoading,
    isError,
  } = useQuery({
    ...queries.drafts.detail(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (initialDraft) {
      setDraft(initialDraft);
    }
  }, [initialDraft, setDraft]);

  const assets = useMemo(() => draft?.draft_assets?.filter(Boolean) || [], [draft]);
  const { signedUrls } = useSignedUrls(assets);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = assets.findIndex((asset) => asset.id === active.id);
      const newIndex = assets.findIndex((asset) => asset.id === over.id);
      const newOrder = arrayMove(assets, oldIndex, newIndex);
      reorderAssets(newOrder);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setEditingAsset(null);
      setEditingFile(event.target.files[0]);
    }
  };

  const handleSaveCroppedImage = async (croppedImage: Blob) => {
    if (!draft) return;
    const file = new File([croppedImage], "cropped.jpg", { type: "image/jpeg" });
    const uploadedMedia = await uploadMedia(file, draft.id.toString());

    if (editingAsset) {
      const updatedAsset = {
        ...editingAsset,
        asset_url: uploadedMedia.asset_url,
      };
      updateAsset(updatedAsset);
    } else {
      const newAsset = await addDraftAsset({
        draft_id: draft.id,
        asset_url: uploadedMedia.asset_url,
        asset_type: uploadedMedia.asset_type,
        order: assets.length + 1,
      });
      if (newAsset) {
        addAssetToStore(newAsset);
      }
    }

    queryClient.invalidateQueries(queries.drafts.detail(id!));
    setEditingFile(null);
    setEditingAsset(null);
    setEditingImageUrl(null);
  };

  const saveChangesMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error("No draft to save");
      return updateDraftAssets(draft.id, assets);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queries.drafts.detail(id!));
    },
  });

  if (isLoading) return <div>Loading draft...</div>;
  if (isError) return <div>Error loading draft.</div>;
  if (!draft) return <div>Draft not found.</div>;

  return (
    <div className="container mx-auto p-4">
      {(editingFile || editingImageUrl) && (
        <ImageEditor
          file={editingFile}
          assetUrl={editingImageUrl || undefined}
          onSave={handleSaveCroppedImage}
          onCancel={() => {
            setEditingFile(null);
            setEditingImageUrl(null);
          }}
        />
      )}
      <div className="mb-4 flex justify-between items-center">
        <Link to="/drafts" className="text-sm text-foreground hover:underline">
          &larr; Back to Drafts
        </Link>
        <Button onClick={() => saveChangesMutation.mutate()} disabled={saveChangesMutation.isPending} className="mt-4">
          {saveChangesMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="grid grid-cols-3 gap-4">
            <DndContextTyped sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={assets.map((asset) => asset.id)} strategy={horizontalListSortingStrategy}>
                {assets.map((asset) => {
                  const url = signedUrls[asset.asset_url];
                  if (!url) return null;
                  return (
                    <SortableAsset
                      key={asset.id}
                      asset={asset}
                      url={url}
                      onClick={() => {
                        setEditingAsset(asset);
                        setEditingImageUrl(url);
                      }}
                    />
                  );
                })}
              </SortableContext>
            </DndContextTyped>
            <label
              htmlFor="file-upload"
              className="w-full aspect-[9/16] flex items-center justify-center bg-gray-200 rounded-lg cursor-pointer">
              <span className="text-4xl">+</span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/webp,image/jpeg,video/mp4"
              />
            </label>
          </div>
        </div>
        <div>
          <DraftPublisher draft={draft} />
        </div>
      </div>
    </div>
  );
};

export default DraftDetailPage;
