import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
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
import { Post, DraftPost, Asset } from "../types";
import { NewPostDetailAssetButton } from "./NewPostDetailAssetButton";
import { generateVideoThumbnail, processVideo } from "../utils";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface PostDetailAssetListProps {
  post: Post | DraftPost | null;
  setPost?: (post: Post | DraftPost) => void;
  setIsDirty?: (isDirty: boolean) => void;
  viewOnly?: boolean;
}

const PostDetailAssetList = ({ post, setPost, setIsDirty, viewOnly = false }: PostDetailAssetListProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const assets: Asset[] = useMemo(
    () =>
      post?.post_assets
        .map((asset) => ("status" in asset ? (asset as Asset) : ({ ...asset, status: "unchanged" } as Asset)))
        .filter((asset) => asset.status !== "deleted") || [],
    [post]
  );

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [assets, checkScrollability]);

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
      const newAssets = arrayMove(assets, oldIndex, newIndex);
      if (post && setPost && setIsDirty) {
        setPost({ ...post, post_assets: newAssets });
        setIsDirty(true);
      }
    }
    setActiveAsset(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const videoFile = files.find((file) => file.type.startsWith("video/"));
      const hasVideo = assets.some((asset) => asset.asset_type === "videos");

      if (videoFile && hasVideo) {
        toast.error("Only one video is allowed per post.");
        return;
      }

      if (videoFile && files.length > 1) {
        toast.error("You can only upload one video at a time.");
        return;
      }

      const processedFiles: File[] = [];
      const thumbnails: (File | null)[] = [];

      setIsProcessing(true);
      for (const file of files) {
        if (file.type.startsWith("video/")) {
          try {
            const processedVideoFile = await processVideo(file);
            const thumbnail = await generateVideoThumbnail(processedVideoFile);
            processedFiles.push(processedVideoFile);
            thumbnails.push(thumbnail);
          } catch (error) {
            console.error("Error processing video:", error);
            toast.error("Failed to process video.");
          }
        } else {
          processedFiles.push(file);
          thumbnails.push(null);
        }
      }
      setIsProcessing(false);

      if (processedFiles.length > 0 && post && setPost && setIsDirty) {
        const newAssets: Asset[] = processedFiles.map((file, index) => ({
          id: uuidv4(),
          asset_url: URL.createObjectURL(file),
          asset_type: file.type.startsWith("video/") ? "videos" : "slides",
          status: "new",
          file: file,
          thumbnail_path: thumbnails[index] ? URL.createObjectURL(thumbnails[index] as Blob) : null,
          blurhash: null,
          created_at: new Date().toISOString(),
          post_id: post.id,
          sort_order: post.post_assets.length + index,
          user_id: "", // This will be set on the server
        }));
        setPost({ ...post, post_assets: [...post.post_assets, ...newAssets] });
        setIsDirty(true);
      }
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
        className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
        disabled={!canScrollLeft}>
        <ChevronLeftIcon className="h-6 w-6" />
      </Button>
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto px-12 w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <div className="flex gap-4 p-4">
            <SortableContext items={assets.map((asset) => asset.id!)} strategy={horizontalListSortingStrategy}>
              {assets.map((asset) => (
                <PostDetailAsset
                  key={asset.id}
                  asset={asset}
                  onRemove={() => {
                    if (post && setPost && setIsDirty) {
                      const newAssets = post.post_assets.map((a) =>
                        a.id === asset.id ? { ...a, status: "deleted" } : a
                      );
                      setPost({ ...post, post_assets: newAssets });
                      setIsDirty(true);
                    }
                  }}
                  viewOnly={viewOnly}
                />
              ))}
            </SortableContext>
            {!viewOnly && <NewPostDetailAssetButton onFileChange={handleFileChange} disabled={isProcessing} />}
          </div>
          <DragOverlay>
            {activeAsset ? <AssetCard asset={activeAsset} onRemove={() => {}} viewOnly={viewOnly} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      <Button
        onClick={() => handleScroll("right")}
        variant="outline"
        size="icon"
        className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
        disabled={!canScrollRight}>
        <ChevronRightIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PostDetailAssetList;
