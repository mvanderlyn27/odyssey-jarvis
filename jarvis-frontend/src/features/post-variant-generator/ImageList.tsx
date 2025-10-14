import { Asset } from "@/store/useEditPostStore";
import { cn } from "@/lib/utils";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ImageListProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
  onAddNewAsset: (file: File) => void;
}

export const ImageList = ({ assets, selectedAsset, onSelectAsset, onAddNewAsset }: ImageListProps) => {
  const assetsForSignedUrls = useMemo(
    () => assets.filter((asset) => asset.asset_url && !asset.asset_url.startsWith("blob:")),
    [assets]
  );
  const { signedUrls } = useSignedUrls(assetsForSignedUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNewClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddNewAsset(file);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0 w-32 p-4 bg-gray-100">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col gap-2">
          {assets.map((asset) => {
            const imageUrl = asset.file
              ? URL.createObjectURL(asset.file)
              : signedUrls[asset.asset_url] || asset.asset_url;
            return (
              <img
                key={asset.id}
                src={imageUrl}
                alt="asset"
                className={cn(
                  "w-full h-auto rounded-md cursor-pointer",
                  selectedAsset?.id === asset.id && "ring-2 ring-blue-500"
                )}
                onClick={() => onSelectAsset(asset)}
              />
            );
          })}
          <Button onClick={handleAddNewClick} className="justify-center items-center ">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
