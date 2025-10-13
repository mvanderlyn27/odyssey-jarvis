import { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";

interface ImageEditorProps {
  file?: File | null;
  assetUrl?: string;
  onSave: (croppedImage: Blob) => void;
  onCancel: () => void;
}

const ImageEditor = ({ file, assetUrl, onSave, onCancel }: ImageEditorProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [imgSrc, setImgSrc] = useState<string>(assetUrl || "");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const aspectRatio = 9 / 16;
    const imageAspectRatio = width / height;

    if (imageAspectRatio > aspectRatio) {
      const newWidth = height * aspectRatio;
      setCrop({
        unit: "px",
        x: (width - newWidth) / 2,
        y: 0,
        width: newWidth,
        height: height,
      });
    } else {
      const newHeight = width / aspectRatio;
      setCrop({
        unit: "px",
        x: 0,
        y: (height - newHeight) / 2,
        width: width,
        height: newHeight,
      });
    }
  };

  const handleSave = async () => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImage = await getCroppedImg(imgRef.current, crop);
      onSave(croppedImage);
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
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result as string));
      reader.readAsDataURL(file);
    } else if (assetUrl) {
      setImgSrc(assetUrl);
    }
  }, [file, assetUrl]);

  const handleReplaceImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result as string));
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={9 / 16}>
          <img src={imgSrc} onLoad={onImageLoad} alt="Crop preview" />
        </ReactCrop>
        <div className="flex justify-between mt-4">
          <Button onClick={handleReplaceImage} variant="outline">
            Replace Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/webp,image/jpeg"
          />
          <div>
            <Button onClick={onCancel} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} className="ml-2">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
