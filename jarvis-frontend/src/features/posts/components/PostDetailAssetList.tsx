import React, { useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { PostDetailAsset, AssetCard } from "@/features/posts/components/PostDetailAsset";
import { useEditPostStore } from "@/store/useEditPostStore";
import { Post, DraftPost, Asset } from "../types";

const PostDetailAssetList = ({ post: postProp, viewOnly = false }: { post?: Post | DraftPost; viewOnly?: boolean }) => {
  const { post: postFromStore, reorderAssets, addAssets, removeAsset } = useEditPostStore();
  const post = postProp || postFromStore;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);

  const assets: Asset[] = useMemo(
    () =>
      post?.post_assets.map((asset) =>
        "status" in asset ? (asset as Asset) : ({ ...asset, status: "unchanged" } as Asset)
      ) || [],
    [post]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const asset = assets.find((asset) => asset.id === active.id);
    if (asset) {
      setActiveAsset(asset);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((asset) => asset.id === active.id);
      const newIndex = assets.findIndex((asset) => asset.id === over.id);
      reorderAssets(arrayMove(assets, oldIndex, newIndex));
    }
    setActiveAsset(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      files.sort((a, b) => a.name.localeCompare(b.name));
      addAssets(files);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300 + 16;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex items-center">
      <Button
        onClick={() => handleScroll("left")}
        variant="outline"
        size="icon"
        className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background">
        <ChevronLeftIcon className="h-6 w-6" />
      </Button>
      <div ref={scrollContainerRef} className="overflow-x-auto px-8 w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <SortableContext items={assets.map((asset) => asset.id!)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 p-4">
              {assets.map((asset) => (
                <PostDetailAsset
                  key={asset.id}
                  asset={asset}
                  onRemove={() => removeAsset(asset.id)}
                  viewOnly={viewOnly}
                />
              ))}
              {!viewOnly && (
                <label
                  htmlFor="file-upload"
                  className="w-full aspect-[9/16] flex items-center justify-center bg-muted rounded-lg cursor-pointer">
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
              )}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeAsset ? <AssetCard asset={activeAsset} onRemove={() => {}} viewOnly={viewOnly} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      <Button
        onClick={() => handleScroll("right")}
        variant="outline"
        size="icon"
        className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-12 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background">
        <ChevronRightIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PostDetailAssetList;
