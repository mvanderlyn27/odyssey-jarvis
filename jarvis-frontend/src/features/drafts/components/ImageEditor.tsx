import { useRef, useEffect, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { useImageEditorStore } from "@/store/useImageEditorStore";

interface ImageEditorProps {
  assetUrl?: string;
  initialCrop?: Crop;
  onSaveAll: (results: { croppedImage: Blob; crop: Crop; originalFile: File }[]) => void;
  onSaveAndClose: (croppedImage: Blob, crop: Crop) => void;
  onCancel: () => void;
  onRemove?: () => void;
}

const ImageEditor = ({ assetUrl, initialCrop, onSaveAll, onSaveAndClose, onCancel, onRemove }: ImageEditorProps) => {
  const { files, currentImageIndex, setCurrentImageIndex, crops, setCrop } = useImageEditorStore();
  const [imgSrc, setImgSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [internalCrop, setInternalCrop] = useState<Crop | undefined>(initialCrop);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    // Prioritize initialCrop from props, then from the store.
    // If neither exists, `internalCrop` will be undefined, and no crop will be shown.
    setInternalCrop(initialCrop || crops[currentImageIndex]);
  };

  const handleNext = () => {
    // Save the current crop to the store if it exists.
    if (internalCrop) {
      setCrop(currentImageIndex, internalCrop);
    }
    if (currentImageIndex < files.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleSave = async () => {
    if (!imgRef.current) return;

    // If the user has interacted and created a crop, use it.
    if (internalCrop && internalCrop.width && internalCrop.height) {
      // Single image edit workflow
      if (files.length === 0) {
        const newCroppedImage = await getCroppedImg(imgRef.current, internalCrop);
        onSaveAndClose(newCroppedImage, internalCrop);
        return;
      }

      // Multi-image save all workflow
      const finalCrops = [...crops];
      finalCrops[currentImageIndex] = internalCrop;

      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const crop = finalCrops[i];
        if (file && crop && crop.width) {
          const tempImg = new Image();
          tempImg.src = URL.createObjectURL(file);
          await new Promise((resolve) => (tempImg.onload = resolve));
          const croppedImage = await getCroppedImg(tempImg, crop);
          results.push({ croppedImage, crop, originalFile: file });
        } else if (file) {
          // If there's no crop, return the original file.
          const fullCrop: Crop = { unit: "px", x: 0, y: 0, width: 0, height: 0 };
          results.push({ croppedImage: file, crop: fullCrop, originalFile: file });
        }
      }
      onSaveAll(results);
    } else {
      // The user did not interact with the cropper.
      // We will treat this as "save the full, uncropped image".
      const fullCrop: Crop = { unit: "px", x: 0, y: 0, width: 0, height: 0 };

      // Single image workflow
      if (files.length === 0) {
        const response = await fetch(imgSrc);
        const blob = await response.blob();
        onSaveAndClose(blob, fullCrop);
        return;
      }

      // Multi-image workflow
      const results = files.map((file) => ({
        croppedImage: file,
        crop: fullCrop,
        originalFile: file,
      }));
      onSaveAll(results);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ReactCrop crop={internalCrop} onChange={setInternalCrop} aspect={9 / 16}>
              <img
                src={imgSrc}
                onLoad={onImageLoad}
                alt="Crop preview"
                className="w-full"
                crossOrigin={imgSrc.startsWith("http") ? "anonymous" : undefined}
              />
            </ReactCrop>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <div className="grid grid-cols-3 gap-2">
              {files.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Thumbnail ${index}`}
                  className={`w-full aspect-square object-cover rounded-md cursor-pointer ${
                    index === currentImageIndex ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
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
