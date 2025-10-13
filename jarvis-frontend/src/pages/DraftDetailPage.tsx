import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo, useEffect, useState } from "react";
import DraftPublisher from "@/features/drafts/components/DraftPublisher";
import { useDraftStore, DraftAssetWithStatus } from "@/store/useDraftStore";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
const DndContextTyped = DndContext as any;
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import ImageEditor, { CroppedArea } from "@/features/drafts/components/ImageEditor";
import SortableAsset from "@/features/drafts/components/SortableAsset";
import { useImageEditorStore } from "@/store/useImageEditorStore";
import { syncDraftAssets } from "@/features/drafts/api";

const DraftDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const {
    draft,
    setDraft,
    reorderAssets,
    updateAsset,
    addAsset: addAssetToStore,
    removeAsset,
    isDirty,
    setDirty,
  } = useDraftStore();
  const { setFiles: setEditorFiles, reset: resetEditor } = useImageEditorStore();
  const [editingAsset, setEditingAsset] = useState<DraftAssetWithStatus | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const assets = useMemo(() => draft?.draft_assets?.filter((asset) => asset.status !== "deleted") || [], [draft]);
  const assetsForSignedUrls = useMemo(() => assets.filter((asset) => asset.asset_url && !asset.file), [assets]);
  const { signedUrls } = useSignedUrls(assetsForSignedUrls);

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
      setEditorFiles(Array.from(event.target.files));
      setIsEditorOpen(true);
    }
  };

  const handleRemoveAsset = () => {
    if (editingAsset) {
      removeAsset(editingAsset.id);
      setIsEditorOpen(false);
      setEditingAsset(null);
      setEditingImageUrl(null);
    }
  };

  const handleSaveAll = (results: { croppedImage: Blob; crop: CroppedArea; originalFile: File }[]) => {
    if (!draft) return;

    for (const result of results) {
      const { croppedImage, crop, originalFile } = result;
      const randomName = `${Math.random().toString(36).substring(2, 15)}.jpg`;
      const file = new File([croppedImage], randomName, { type: "image/jpeg" });
      addAssetToStore({
        id: crypto.randomUUID(),
        asset_type: "slides",
        asset_url: "",
        file,
        originalFile,
        crop,
      });
    }

    setIsEditorOpen(false);
    setEditingAsset(null);
    setEditingImageUrl(null);
    resetEditor();
  };

  const handleSaveAndClose = async (croppedImage: Blob, crop: CroppedArea) => {
    if (editingAsset) {
      const randomName = `${Math.random().toString(36).substring(2, 15)}.jpg`;
      const file = new File([croppedImage], randomName, { type: "image/jpeg" });

      let originalFile = editingAsset.originalFile;
      if (editingAsset.status === "existing" && editingImageUrl && !originalFile) {
        // If it's the first edit of an existing asset, fetch the original image
        // to store it for all future re-edits.
        const response = await fetch(editingImageUrl);
        const blob = await response.blob();
        originalFile = new File([blob], "original.jpg", { type: blob.type });
      }

      updateAsset({ id: editingAsset.id, file, crop, originalFile });
    }
    setIsEditorOpen(false);
    setEditingAsset(null);
    setEditingImageUrl(null);
    resetEditor();
  };

  const saveChangesMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error("No draft to save");
      return syncDraftAssets(draft.id, draft.draft_assets);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queries.drafts.detail(id!));
      setDirty(false);
    },
  });

  if (isLoading) return <div>Loading draft...</div>;
  if (isError) return <div>Error loading draft.</div>;
  if (!draft) return <div>Draft not found.</div>;

  return (
    <div className="container mx-auto p-4">
      {isEditorOpen && (
        <ImageEditor
          assetUrl={editingImageUrl || undefined}
          initialCrop={(editingAsset as any)?.crop}
          onSaveAll={handleSaveAll}
          onSaveAndClose={handleSaveAndClose}
          onCancel={() => {
            resetEditor();
            setIsEditorOpen(false);
            setEditingImageUrl(null);
          }}
          onRemove={editingAsset ? handleRemoveAsset : undefined}
        />
      )}
      <div className="mb-4 flex justify-between items-center">
        <Link to="/drafts" className="text-sm text-foreground hover:underline">
          &larr; Back to Drafts
        </Link>
        <div className="flex items-center">
          {isDirty && <span className="mr-2 text-sm text-yellow-500">Unsaved changes</span>}
          <Button
            onClick={() => saveChangesMutation.mutate()}
            disabled={saveChangesMutation.isPending || !isDirty}
            className="mt-4">
            {saveChangesMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="grid grid-cols-3 gap-4">
            <DndContextTyped sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={assets.map((asset) => asset.id)} strategy={horizontalListSortingStrategy}>
                {assets.map((asset) => {
                  // Determine the display URL: use the local cropped file if it exists, otherwise the signed URL.
                  const displayUrl = asset.file ? URL.createObjectURL(asset.file) : signedUrls[asset.asset_url];

                  // Determine the editor URL: always prioritize the original file, then the signed URL.
                  // This is crucial to prevent the "tiny crop" issue.
                  const editorUrl = asset.originalFile
                    ? URL.createObjectURL(asset.originalFile)
                    : signedUrls[asset.asset_url];

                  // Don't render if we don't have a URL to display.
                  if (!displayUrl) {
                    return (
                      <div
                        key={asset.id}
                        className="w-full aspect-[9/16] flex items-center justify-center bg-gray-200 rounded-lg">
                        Processing...
                      </div>
                    );
                  }

                  return (
                    <SortableAsset
                      key={asset.id}
                      asset={asset}
                      url={displayUrl}
                      onClick={() => {
                        // Only open the editor if we have a valid URL for the original image.
                        if (editorUrl) {
                          setEditingAsset(asset);
                          setEditingImageUrl(editorUrl);
                          setIsEditorOpen(true);
                        }
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
                multiple
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
