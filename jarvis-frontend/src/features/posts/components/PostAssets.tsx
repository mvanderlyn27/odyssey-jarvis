import { useMemo, useRef } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
const DndContextTyped = DndContext as any;
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import SortableAsset from "@/features/posts/components/SortableAsset";
import { useEditPostStore, DraftAssetWithStatus } from "@/store/useEditPostStore";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { v4 as uuidv4 } from "uuid";

interface PostAssetsProps {
  onEditAsset: (asset: DraftAssetWithStatus) => void;
}

const PostAssets = ({ onEditAsset }: PostAssetsProps) => {
  const { post, reorderAssets, openEditor } = useEditPostStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const assets = useMemo(() => post?.post_assets?.filter((asset) => asset) || [], [post]);
  const assetsForSignedUrls = useMemo(
    () => assets.filter((asset) => asset.asset_url && !asset.asset_url.startsWith("blob:")),
    [assets]
  );
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
      const files = Array.from(event.target.files);
      const newAssets: DraftAssetWithStatus[] = files.map((file) => ({
        id: uuidv4(),
        asset_url: URL.createObjectURL(file),
        asset_type: file.type.startsWith("video") ? "videos" : "slides",
        status: "new",
        file,
        originalFile: file,
        created_at: new Date().toISOString(),
        post_id: post!.id,
        order: 0,
      }));
      openEditor(newAssets, "add");
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
        className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/80 hover:bg-white">
        <ChevronLeftIcon className="h-6 w-6" />
      </Button>
      <div ref={scrollContainerRef} className="overflow-x-auto px-8 w-full">
        <div className="grid grid-flow-col auto-cols-[300px] gap-4 p-4">
          <DndContextTyped sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={assets.map((asset) => asset.id)} strategy={horizontalListSortingStrategy}>
              {assets.map((asset) => {
                const displayUrl = signedUrls[asset.asset_url] || asset.asset_url;
                const editorUrl = asset.originalFile
                  ? URL.createObjectURL(asset.originalFile)
                  : signedUrls[asset.asset_url] || asset.asset_url;

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
                      if (editorUrl) {
                        onEditAsset(asset);
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
      <Button
        onClick={() => handleScroll("right")}
        variant="outline"
        size="icon"
        className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/80 hover:bg-white">
        <ChevronRightIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PostAssets;
