import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Asset } from "@/store/useEditPostStore";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";

const SortableAsset = ({
  asset,
  url,
  onRemove,
  viewOnly = false,
  preferFullSize = false,
}: {
  asset: Asset;
  url: string;
  onRemove: () => void;
  viewOnly?: boolean;
  preferFullSize?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: asset.id!,
    disabled: viewOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-full aspect-[9/16] relative group overflow-hidden rounded-lg ${!viewOnly ? "cursor-grab" : ""}`}>
      <div className="w-full h-full">
        {asset.asset_type === "slides" ? (
          <SignedUrlImage
            thumbnailPath={asset.thumbnail_path}
            fullSizePath={asset.asset_url}
            blurhash={asset.blurhash}
            blobUrl={asset.file ? URL.createObjectURL(asset.file) : null}
            size="large"
            preferFullSize={preferFullSize}
          />
        ) : (
          <video src={url} className="w-full h-full object-cover rounded-lg" controls />
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
    </div>
  );
};

export default SortableAsset;
