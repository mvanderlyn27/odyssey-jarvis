import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";
import { Asset } from "../types";

interface AssetCardProps {
  asset: Asset;
  onRemove: () => void;
  viewOnly?: boolean;
  isDragging?: boolean;
}

export const AssetCard = React.forwardRef<HTMLDivElement, AssetCardProps & { [key: string]: any }>(
  ({ asset, onRemove, viewOnly, isDragging, ...props }, ref) => {
    return (
      <div ref={ref} {...props} className="w-[300px] flex-shrink-0">
        <motion.div
          className={`w-full aspect-[9/16] relative group overflow-hidden rounded-lg ${!viewOnly ? "cursor-grab" : ""}`}
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
          <div className="w-full h-full">
            {asset.asset_type === "slides" ? (
              <SignedUrlImage
                thumbnailPath={asset.thumbnail_path}
                fullSizePath={asset.asset_url}
                blurhash={asset.blurhash}
                blobUrl={asset.file instanceof Blob ? URL.createObjectURL(asset.file) : undefined}
                size="large"
                preferFullSize={true}
              />
            ) : (
              <video src={asset.asset_url} className="w-full h-full object-cover rounded-lg" controls />
            )}
          </div>
          {!viewOnly && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}>
              <XIcon className="h-4 w-4" />
            </Button>
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
