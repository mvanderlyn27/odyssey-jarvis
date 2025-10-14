import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Asset } from "@/store/useEditPostStore";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

const SortableAsset = ({ asset, url, onRemove }: { asset: Asset; url: string; onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: asset.id! });

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
      className="w-full aspect-[9/16] relative cursor-grab group">
      <div className="w-full h-full">
        {asset.asset_type === "slides" ? (
          <img src={url} alt={`Draft asset ${asset.id}`} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <video src={url} className="w-full h-full object-cover rounded-lg" controls />
        )}
      </div>
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}>
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SortableAsset;
