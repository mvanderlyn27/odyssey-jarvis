import { cn } from "@/lib/utils";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";
import { Asset } from "../posts/types";

interface ImageListProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
  onAddNewAsset: (file: File, asset_type: "photo" | "video") => void;
}

export const ImageList = ({ assets, selectedAsset, onSelectAsset, onAddNewAsset }: ImageListProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNewClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const asset_type = file.type.startsWith("video/") ? "video" : "photo";
      if (asset_type === "video" && assets.some((asset) => asset.asset_type === "video")) {
        alert("You can only upload one video per post.");
        return;
      }
      onAddNewAsset(file, asset_type);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0 w-32 p-4 bg-gray-100">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                "w-full h-auto rounded-md cursor-pointer",
                selectedAsset?.id === asset.id && "ring-2 ring-blue-500"
              )}
              onClick={() => onSelectAsset(asset)}>
              <SignedUrlImage
                thumbnailPath={asset.thumbnail_path}
                fullSizePath={asset.asset_url}
                blurhash={asset.blurhash}
                size="medium"
              />
            </div>
          ))}
          <Button onClick={handleAddNewClick} className="justify-center items-center ">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
