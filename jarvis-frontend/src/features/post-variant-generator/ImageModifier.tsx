import { useEffect, useState, useCallback, useMemo } from "react";
import { Area } from "react-easy-crop";
import { useEditPostStore, Asset } from "@/store/useEditPostStore";
import { ImageList } from "./ImageList";
import ImageEditor from "./ImageEditor";
import { ImageControls } from "./ImageControls";
import { getCroppedImg, getRandomEditSettings } from "@/lib/utils";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { ImageEditingPanel } from "./ImageEditingPanel";
import { useImageEditorStore, defaultSettings, EditSettings } from "./useImageEditorStore";

const ImageModifier = () => {
  const { updateAssetFile, addAsset: addAssetToPost } = useEditPostStore();
  const {
    assets: editorAssets,
    editSettings: allEditSettings,
    setEditSettings: setAllEditSettings,
    closeEditor,
    removeAsset: removeEditorAsset,
    addAssets: addAssetsToEditor,
  } = useImageEditorStore();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [isDirty, setIsDirty] = useState(false);

  const assetsForSignedUrls = useMemo(
    () => editorAssets.filter((asset) => asset.asset_url && !asset.asset_url.startsWith("blob:")),
    [editorAssets]
  );
  const { signedUrls } = useSignedUrls(assetsForSignedUrls);

  const editSettings = useMemo(
    () => (selectedAsset ? allEditSettings[selectedAsset.id] || defaultSettings : defaultSettings),
    [selectedAsset, allEditSettings]
  );

  const setCurrentEditSettings = useCallback(
    (updater: (prev: EditSettings) => EditSettings) => {
      if (selectedAsset) {
        setAllEditSettings(selectedAsset.id, updater);
        setIsDirty(true);
      }
    },
    [selectedAsset, setAllEditSettings]
  );

  useEffect(() => {
    if (editorAssets.length > 0 && !selectedAsset) {
      setSelectedAsset(editorAssets[0]);
    } else if (editorAssets.length === 0) {
      closeEditor();
    }
  }, [editorAssets, selectedAsset, closeEditor]);

  useEffect(() => {
    if (selectedAsset) {
      const settings = allEditSettings[selectedAsset.id];
      if (settings && settings.cropCoordinates) {
        setCrop(settings.cropCoordinates);
      } else {
        setCrop({ x: 0, y: 0 });
      }
    }
  }, [selectedAsset, allEditSettings]);

  const imgSrc = useMemo(() => {
    if (!selectedAsset) return "";
    const asset = selectedAsset.file ? selectedAsset.file : selectedAsset.originalFile;
    if (asset) {
      return URL.createObjectURL(asset);
    }
    return signedUrls[selectedAsset.asset_url] || selectedAsset.asset_url;
  }, [selectedAsset, signedUrls]);

  const onCropComplete = useCallback(
    (croppedAreaPixels: Area) => {
      setCurrentEditSettings((prev) => ({ ...prev, crop: croppedAreaPixels }));
    },
    [setCurrentEditSettings]
  );

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleAddNewAsset = (file: File) => {
    const postId = useEditPostStore.getState().post?.id;
    if (postId) {
      addAssetsToEditor([file], parseInt(postId, 10));
    }
  };

  const handleSave = async () => {
    for (const asset of editorAssets) {
      const settings = allEditSettings[asset.id];
      if (!settings) continue;

      const isNew = asset.status === "new";
      const hasBeenModified = !!settings.crop;

      if (!isNew && !hasBeenModified) continue;

      let imageFile = asset.originalFile;
      if (!imageFile) {
        const url = signedUrls[asset.asset_url] || asset.asset_url;
        if (url) {
          const file = await urlToFile(url);
          if (file) {
            imageFile = file;
          }
        }
      }

      if (!imageFile) {
        console.error(`Could not get image file for asset ${asset.id}`);
        continue;
      }

      if (hasBeenModified && settings.crop) {
        const imageUrl = URL.createObjectURL(imageFile);
        try {
          const croppedImageBlob = await getCroppedImg(imageUrl, settings.crop, settings);
          const croppedImageFile = new File([croppedImageBlob], imageFile.name, { type: "image/jpeg" });
          const { crop, zoom, rotation } = settings;

          if (isNew) {
            addAssetToPost(croppedImageFile);
          } else {
            updateAssetFile(asset.id, croppedImageFile, { crop: crop || undefined, zoom, rotation });
          }
        } catch (error) {
          console.error(`Error cropping image for asset ${asset.id}:`, error);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      } else if (isNew) {
        addAssetToPost(imageFile);
      }
    }

    setIsDirty(false);
    closeEditor();
  };

  const handleDelete = () => {
    if (!selectedAsset) return;
    const assetIdToDelete = selectedAsset.id;
    const currentIndex = editorAssets.findIndex((a) => a.id === assetIdToDelete);

    removeEditorAsset(assetIdToDelete);

    const remainingAssets = editorAssets.filter((a) => a.id !== assetIdToDelete);
    if (remainingAssets.length > 0) {
      const nextIndex = currentIndex >= remainingAssets.length ? remainingAssets.length - 1 : currentIndex;
      setSelectedAsset(remainingAssets[nextIndex]);
    } else {
      setSelectedAsset(null);
    }
  };

  const handleRandomize = () => {
    if (selectedAsset) {
      const randomSettings = getRandomEditSettings();
      setAllEditSettings(selectedAsset.id, (prev) => ({ ...prev, ...randomSettings }));
      setIsDirty(true);
    }
  };

  const handleRandomizeAll = () => {
    editorAssets.forEach((asset) => {
      const randomSettings = getRandomEditSettings();
      setAllEditSettings(asset.id, (prev) => ({ ...prev, ...randomSettings }));
    });
    setIsDirty(true);
  };

  const urlToFile = async (url: string): Promise<File | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.substring(url.lastIndexOf("/") + 1);
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error("Error fetching URL:", error);
      return null;
    }
  };

  if (!selectedAsset) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full h-[80vh] flex">
        <ImageList
          assets={editorAssets}
          selectedAsset={selectedAsset}
          onSelectAsset={handleSelectAsset}
          onAddNewAsset={handleAddNewAsset}
        />
        <div className="flex-grow flex flex-col">
          <div className="flex-grow flex gap-4 p-4">
            <ImageEditingPanel editSettings={editSettings} setCurrentEditSettings={setCurrentEditSettings} />
            <div className="w-2/3 h-full">
              <ImageEditor
                selectedAsset={selectedAsset}
                imgSrc={imgSrc}
                crop={crop}
                zoom={editSettings.zoom}
                aspect={9 / 16}
                onCropChange={(location) => {
                  setCrop(location);
                  setCurrentEditSettings((prev) => ({ ...prev, cropCoordinates: location }));
                }}
                onZoomChange={(newZoom) => setCurrentEditSettings((s) => ({ ...s, zoom: newZoom }))}
                onCropComplete={onCropComplete}
                onMediaLoaded={() => {}}
                editSettings={editSettings}
              />
            </div>
          </div>
          <ImageControls
            onSave={handleSave}
            onCancel={closeEditor}
            onDelete={handleDelete}
            isDirty={isDirty}
            onRandomize={handleRandomize}
            onRandomizeAll={handleRandomizeAll}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModifier;
