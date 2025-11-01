import React, { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { XIcon, Video, Replace } from "lucide-react";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";
import { Asset } from "../types";
import { useEditPostStore } from "@/store/useEditPostStore";
import { generateVideoThumbnail } from "../utils";
import { toast } from "sonner";

interface AssetCardProps {
  asset: Asset;
  onRemove: () => void;
  viewOnly?: boolean;
  isDragging?: boolean;
}

export const AssetCard = React.forwardRef<HTMLDivElement, AssetCardProps & { [key: string]: any }>(
  ({ asset, onRemove, viewOnly, isDragging, ...props }, ref) => {
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { updateAssetFile } = useEditPostStore();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.type.startsWith("video/")) {
          try {
            const thumbnail = await generateVideoThumbnail(file);
            updateAssetFile(asset.id, file, { thumbnail });
          } catch (error) {
            console.error("Error generating video thumbnail:", error);
            toast.error("Failed to generate video thumbnail.");
          }
        } else {
          updateAssetFile(asset.id, file);
        }
      }
    };

    const handleReplaceClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <div
        ref={ref}
        {...props}
        className="w-[300px] flex-shrink-0"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}>
        <motion.div
          className={`w-full aspect-[9/16] relative group overflow-hidden rounded-lg ${!viewOnly ? "cursor-grab" : ""}`}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          animate={{ scale: isDragging ? 1.05 : 1 }}>
          <div className="w-full h-full">
            {asset.asset_type === "video" && <Video className="absolute top-2 left-2 text-white h-6 w-6 z-10" />}
            {asset.asset_type === "video" && isHovering ? (
              <video src={asset.asset_url} className="w-full h-full object-cover rounded-lg" autoPlay muted loop />
            ) : (
              <SignedUrlImage
                thumbnailPath={asset.thumbnail_path}
                fullSizePath={asset.asset_url}
                blurhash={asset.blurhash}
                blobUrl={asset.file instanceof Blob ? URL.createObjectURL(asset.file) : undefined}
                size="large"
                preferFullSize={true}
                isDragging={isDragging}
              />
            )}
          </div>
          {!viewOnly && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/webp,image/jpeg,video/mp4"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplaceClick();
                }}>
                <Replace className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}>
                <XIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </motion.div>
      </div>
    );
  }
);

export const PostDetailAsset = ({ asset, onRemove, viewOnly }: AssetCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: asset.id!,
    disabled: viewOnly,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <AssetCard
      ref={setNodeRef}
      style={style}
      asset={asset}
      onRemove={onRemove}
      viewOnly={viewOnly}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    />
  );
};
