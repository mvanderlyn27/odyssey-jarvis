import Cropper from "react-easy-crop";
import { Asset } from "@/store/useEditPostStore";
import { EditSettings } from "./useImageEditorStore";

interface ImageEditorProps {
  selectedAsset: Asset | null;
  imgSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  onMediaLoaded: (mediaSize: { width: number; height: number }) => void;
  editSettings: EditSettings;
}

const ImageEditor = ({
  imgSrc,
  crop,
  zoom,
  aspect,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onMediaLoaded,
  selectedAsset,
  editSettings,
}: ImageEditorProps) => {
  const { rotation, flipHorizontal, opacity, hue, contrast, brightness, temperature, vignette, tint, tintAmount } =
    editSettings;

  const imageStyle = {
    transform: `rotate(${rotation}deg) ${flipHorizontal ? "scaleX(-1)" : ""}`,
    filter: `opacity(${opacity}) hue-rotate(${hue}deg) contrast(${contrast}) brightness(${brightness})`,
  };

  const vignetteStyle = {
    boxShadow: `inset 0 0 ${vignette * 200}px rgba(0,0,0,${vignette})`,
  };

  const temperatureStyle = {
    backgroundColor: `rgba(${temperature > 0 ? 255 : 0}, ${temperature > 0 ? 255 - temperature * 10 : 255}, ${
      temperature < 0 ? 255 : 255 - Math.abs(temperature) * 10
    }, ${Math.abs(temperature) / 100})`,
  };

  const tintStyle = {
    backgroundColor: tint,
    opacity: tintAmount,
  };

  return (
    <div className="md:col-span-2 relative h-[600px]" style={{ overflow: "hidden" }}>
      {imgSrc && (
        <div style={imageStyle} className="w-full h-full">
          <Cropper
            key={imgSrc}
            image={imgSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            initialCroppedAreaPixels={selectedAsset?.editSettings?.crop}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
          />
          <div className="absolute inset-0 pointer-events-none" style={vignetteStyle} />
          <div className="absolute inset-0 pointer-events-none" style={temperatureStyle} />
          <div className="absolute inset-0 pointer-events-none" style={tintStyle} />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
