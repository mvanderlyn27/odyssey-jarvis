import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraftAsset } from "@/store/useDraftStore";

const SortableAsset = ({ asset, url, onClick }: { asset: DraftAsset; url: string; onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: asset.id });

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
      className="w-full aspect-[9/16] relative cursor-grab">
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

export default SortableAsset;
