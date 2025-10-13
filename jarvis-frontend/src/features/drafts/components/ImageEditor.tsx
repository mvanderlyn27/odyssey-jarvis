import { useRef, useEffect, useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { useImageEditorStore } from "@/store/useImageEditorStore";

// Define a new type for our crop data, replacing the old 'Crop' type
export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageEditorProps {
  assetUrl?: string;
  initialCrop?: CroppedArea; // Use our new type
  onSaveAll: (results: { croppedImage: Blob; crop: CroppedArea; originalFile: File }[]) => void;
  onSaveAndClose: (croppedImage: Blob, crop: CroppedArea) => void;
  onCancel: () => void;
  onRemove?: () => void;
}

const ImageEditor = ({ assetUrl, initialCrop, onSaveAll, onSaveAndClose, onCancel, onRemove }: ImageEditorProps) => {
  const { files, currentImageIndex, setCurrentImageIndex, crops, setCrop } = useImageEditorStore();
  const [imgSrc, setImgSrc] = useState<string>(assetUrl || "");
  const [crop, setCropState] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 });

  // This function runs when the user stops moving the crop area.
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // This function creates the cropped image blob.
  const getCroppedImg = async (imageSrc: string, pixelCrop: CroppedArea): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous"; // Handle CORS for remote images
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleNext = () => {
    if (croppedAreaPixels) {
      setCrop(currentImageIndex, croppedAreaPixels);
    }
    if (currentImageIndex < files.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleSave = async () => {
    // Ensure the final crop is stored
    const finalCropToSave = croppedAreaPixels;
    if (finalCropToSave) {
      setCrop(currentImageIndex, finalCropToSave);
    }

    // Single image workflow
    if (files.length === 0 && assetUrl && finalCropToSave) {
      const croppedImage = await getCroppedImg(assetUrl, finalCropToSave);
      onSaveAndClose(croppedImage, finalCropToSave);
      return;
    }

    // Multi-image workflow
    const finalCrops = [...crops];
    if (finalCropToSave) {
      finalCrops[currentImageIndex] = finalCropToSave;
    }

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const cropToApply = finalCrops[i];
      if (file && cropToApply) {
        const tempImgSrc = URL.createObjectURL(file);
        const croppedImage = await getCroppedImg(tempImgSrc, cropToApply);
        results.push({ croppedImage, crop: cropToApply, originalFile: file });
        URL.revokeObjectURL(tempImgSrc); // Clean up object URL
      }
    }
    onSaveAll(results);
  };

  // Set the default crop when the image loads
  const onMediaLoaded = useCallback(
    (mediaSize: { width: number; height: number }) => {
      setMediaSize(mediaSize);
      const existingCrop = initialCrop || crops[currentImageIndex];

      if (!existingCrop) {
        // Calculate default 9:16 centered crop
        const { width, height } = mediaSize;
        const aspectRatio = 9 / 16;
        let newWidth, newHeight;

        if (width / height > aspectRatio) {
          newHeight = height;
          newWidth = height * aspectRatio;
        } else {
          newWidth = width;
          newHeight = width / aspectRatio;
        }

        // react-easy-crop centers by default, so we just need to set the zoom
        // to fit the calculated crop area.
        const zoomX = width / newWidth;
        const zoomY = height / newHeight;
        setZoom(Math.max(zoomX, zoomY));
      }
    },
    [initialCrop, crops, currentImageIndex]
  );

  useEffect(() => {
    if (files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result as string));
      reader.readAsDataURL(files[currentImageIndex]);
    } else if (assetUrl) {
      setImgSrc(assetUrl);
    }
  }, [files, currentImageIndex, assetUrl]);

  const isLastImage = currentImageIndex === files.length - 1;
  const existingCrop = initialCrop || crops[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative h-96">
            {imgSrc && (
              <Cropper
                key={imgSrc}
                image={imgSrc}
                crop={crop}
                zoom={zoom}
                aspect={9 / 16}
                initialCroppedAreaPixels={existingCrop}
                onCropChange={setCropState}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                onMediaLoaded={onMediaLoaded}
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <div className="grid grid-cols-3 gap-2">
              {files.length > 0
                ? files.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Thumbnail ${index}`}
                      className={`w-full aspect-square object-cover rounded-md cursor-pointer ${
                        index === currentImageIndex ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))
                : assetUrl && (
                    <img
                      src={assetUrl}
                      alt="Thumbnail"
                      className="w-full aspect-square object-cover rounded-md ring-2 ring-primary"
                    />
                  )}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div>
            {onRemove && (
              <Button onClick={onRemove} variant="destructive" className="ml-2">
                Remove
              </Button>
            )}
          </div>
          <div>
            <Button onClick={onCancel} variant="ghost">
              Cancel
            </Button>
            {files.length > 1 && !isLastImage ? (
              <Button onClick={handleNext} className="ml-2">
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} className="ml-2">
                {files.length > 1 ? "Save All" : "Save"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
