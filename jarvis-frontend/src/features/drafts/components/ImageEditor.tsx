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
    const { width, height } = e.currentTarget;
    const aspectRatio = 9 / 16;
    const imageAspectRatio = width / height;

    if (initialCrop) {
      setInternalCrop(initialCrop);
      return;
    }

    const cropFromStore = crops[currentImageIndex];
    if (cropFromStore) {
      setInternalCrop(cropFromStore);
      return;
    }

    const newCrop: Crop = {
      unit: "px",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    if (imageAspectRatio > aspectRatio) {
      newCrop.width = height * aspectRatio;
      newCrop.height = height;
      newCrop.x = (width - newCrop.width) / 2;
      newCrop.y = 0;
    } else {
      newCrop.height = width / aspectRatio;
      newCrop.width = width;
      newCrop.x = 0;
      newCrop.y = (height - newCrop.height) / 2;
    }
    setInternalCrop(newCrop);
  };

  const handleNext = () => {
    if (internalCrop) {
      setCrop(currentImageIndex, internalCrop);
    }
    if (currentImageIndex < files.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleSave = async () => {
    if (!imgRef.current || !internalCrop?.width || !internalCrop?.height) return;

    // Single image edit workflow
    if (files.length === 0) {
      const newCroppedImage = await getCroppedImg(imgRef.current, internalCrop);
      onSaveAndClose(newCroppedImage, internalCrop);
      return;
    }

    // Multi-image save all workflow
    // First, save the crop for the current image
    const finalCrops = [...crops];
    if (internalCrop) {
      finalCrops[currentImageIndex] = internalCrop;
    }

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const crop = finalCrops[i];
      if (file && crop) {
        // To crop the image, we need to load it into an image element first
        const tempImg = new Image();
        tempImg.src = URL.createObjectURL(file);
        await new Promise((resolve) => (tempImg.onload = resolve));
        const croppedImage = await getCroppedImg(tempImg, crop);
        results.push({ croppedImage, crop, originalFile: file });
      }
    }
    onSaveAll(results);
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
