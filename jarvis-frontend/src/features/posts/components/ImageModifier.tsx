import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { Button } from "@/components/ui/button";
import { useEditPostStore } from "@/store/useEditPostStore";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EditSettings {
  tint: string;
  tintAmount: number;
  compression: number;
  noise: number;
  flipHorizontal: boolean;
  opacity: number;
  hue: number;
  rotation: number;
  brightness: number;
  contrast: number;
  temperature: number;
  vignette: number;
  crop: CroppedArea | null;
  zoom: number;
}

interface ImageModifierProps {}
const defaultSettings: EditSettings = {
  tint: "#ffffff",
  tintAmount: 0,
  compression: 0.92,
  noise: 0,
  flipHorizontal: false,
  opacity: 1,
  hue: 0,
  rotation: 0,
  brightness: 1,
  contrast: 1,
  temperature: 0,
  vignette: 0,
  crop: null,
  zoom: 1,
};

const ImageModifier = ({}: ImageModifierProps) => {
  const {
    editorAssets,
    currentImageIndex,
    setCurrentImageIndex,
    updateEditorAsset,
    closeEditor,
    removeEditorAsset,
    replaceEditorAsset,
    setPostAssets,
    addPostAssets,
    editorMode,
  } = useEditPostStore();

  const assetsForSignedUrls = useMemo(
    () => editorAssets.filter((asset) => asset.asset_url && !asset.asset_url.startsWith("blob:")),
    [editorAssets]
  );
  const { signedUrls } = useSignedUrls(assetsForSignedUrls);

  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCropState] = useState({ x: 0, y: 0 });
  const [allEditSettings, setAllEditSettings] = useState<EditSettings[]>([]);
  const [estimatedSize, setEstimatedSize] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [randomizeOptions, setRandomizeOptions] = useState({
    tint: false,
    tintAmount: false,
    compression: true,
    noise: false,
    flipHorizontal: false,
    opacity: true,
    hue: false,
    rotation: false,
    brightness: false,
    contrast: true,
    temperature: false,
    vignette: false,
  });

  const editSettings = allEditSettings[currentImageIndex] || defaultSettings;

  const setCurrentEditSettings = useCallback(
    (updater: (prev: EditSettings) => EditSettings) => {
      setAllEditSettings((prev) => {
        const newSettings = [...prev];
        if (newSettings[currentImageIndex]) {
          newSettings[currentImageIndex] = updater(newSettings[currentImageIndex]);
        }
        return newSettings;
      });
    },
    [currentImageIndex]
  );

  const handleRandomize = () => {
    setCurrentEditSettings(() => {
      const newSettings = { ...defaultSettings };
      if (randomizeOptions.tintAmount) newSettings.tintAmount = Math.random() * 0.1;
      if (randomizeOptions.compression) newSettings.compression = 0.9 + Math.random() * 0.1;
      if (randomizeOptions.noise) newSettings.noise = Math.floor(Math.random() * 25);
      if (randomizeOptions.opacity) newSettings.opacity = 1 - Math.random() * 0.05;
      if (randomizeOptions.hue) newSettings.hue = Math.floor(Math.random() * 20) - 10;
      if (randomizeOptions.rotation) newSettings.rotation = Math.random() * 4 - 2;
      if (randomizeOptions.brightness) newSettings.brightness = 1 + (Math.random() * 0.1 - 0.05);
      if (randomizeOptions.contrast) newSettings.contrast = 1 + (Math.random() * 0.1 - 0.05);
      if (randomizeOptions.temperature) newSettings.temperature = Math.random() * 20 - 10;
      if (randomizeOptions.vignette) newSettings.vignette = Math.random() * 0.2;
      return newSettings;
    });
  };

  const handleRandomizeAll = () => {
    setAllEditSettings(
      editorAssets.map(() => {
        const newSettings = { ...defaultSettings };
        if (randomizeOptions.tintAmount) newSettings.tintAmount = Math.random() * 0.1;
        if (randomizeOptions.compression) newSettings.compression = 0.9 + Math.random() * 0.1;
        if (randomizeOptions.noise) newSettings.noise = Math.floor(Math.random() * 25);
        if (randomizeOptions.opacity) newSettings.opacity = 1 - Math.random() * 0.05;
        if (randomizeOptions.hue) newSettings.hue = Math.floor(Math.random() * 20) - 10;
        if (randomizeOptions.rotation) newSettings.rotation = Math.random() * 4 - 2;
        if (randomizeOptions.brightness) newSettings.brightness = 1 + (Math.random() * 0.1 - 0.05);
        if (randomizeOptions.contrast) newSettings.contrast = 1 + (Math.random() * 0.1 - 0.05);
        if (randomizeOptions.temperature) newSettings.temperature = Math.random() * 20 - 10;
        if (randomizeOptions.vignette) newSettings.vignette = Math.random() * 0.2;
        return newSettings;
      })
    );
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCurrentEditSettings((prev) => ({ ...prev, crop: croppedAreaPixels }));
    },
    [setCurrentEditSettings]
  );

  const onZoomChange = useCallback(
    (zoom: number) => {
      setCurrentEditSettings((prev) => ({ ...prev, zoom }));
    },
    [setCurrentEditSettings]
  );

  const getCroppedImg = async (imageSrc: string, pixelCrop: CroppedArea, settings: EditSettings): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not get canvas context");

    // TikTok's resolution is 1080x1920 (9:16 aspect ratio)
    const targetWidth = 1080;
    const targetHeight = 1920;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (settings.flipHorizontal) {
      ctx.scale(-1, 1);
    }
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.globalAlpha = settings.opacity;
    ctx.filter = `hue-rotate(${settings.hue}deg) contrast(${settings.contrast}) brightness(${settings.brightness})`;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const finalCrop = {
      x: pixelCrop.x * scaleX,
      y: pixelCrop.y * scaleY,
      width: pixelCrop.width * scaleX,
      height: pixelCrop.height * scaleY,
    };

    ctx.drawImage(image, finalCrop.x, finalCrop.y, finalCrop.width, finalCrop.height, 0, 0, targetWidth, targetHeight);

    if (settings.tintAmount > 0) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = settings.tint;
      ctx.globalAlpha = settings.tintAmount * 0.5;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Temperature effect
    if (settings.temperature !== 0) {
      const temp = settings.temperature;
      const r = temp > 0 ? temp * 2.55 : 0;
      const b = temp < 0 ? -temp * 2.55 : 0;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(${r}, 0, ${b}, 0.1)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Vignette effect
    if (settings.vignette > 0) {
      ctx.globalCompositeOperation = "source-over";
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 3,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${settings.vignette})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (settings.noise > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * settings.noise * 4; // Increased intensity
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    ctx.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas is empty"));
          resolve(new Blob([blob], { type: "image/jpeg" }));
        },
        "image/jpeg",
        settings.compression
      );
    });
  };

  const handleFinish = async () => {
    const newEditorAssets = await Promise.all(
      editorAssets.map(async (asset, index) => {
        if (!asset.originalFile) return asset; // Unchanged asset

        const settings = allEditSettings[index];
        const cropToApply = settings.crop || asset.editSettings?.crop;

        if (!cropToApply) {
          console.warn("No crop settings found for asset, skipping modification", asset.id);
          return asset;
        }

        const imageUrl = URL.createObjectURL(asset.originalFile);
        const croppedImageBlob = await getCroppedImg(imageUrl, cropToApply, settings);
        const croppedImageFile = new File([croppedImageBlob], "modified_image.jpg", { type: "image/jpeg" });

        return {
          ...asset,
          file: croppedImageFile,
          asset_url: URL.createObjectURL(croppedImageFile),
          editSettings: {
            crop: cropToApply,
            zoom: settings.zoom,
            rotation: settings.rotation,
          },
        };
      })
    );

    if (editorMode === "edit") {
      setPostAssets(newEditorAssets);
    } else {
      addPostAssets(newEditorAssets);
    }
    closeEditor();
  };

  const onMediaLoaded = useCallback(
    (mediaSize: { width: number; height: number }) => {
      const { width, height } = mediaSize;
      const aspectRatio = 9 / 16;
      let newWidth = width;
      let newHeight = width / aspectRatio;
      if (width / height > aspectRatio) {
        newHeight = height;
        newWidth = height * aspectRatio;
      }
      const zoomX = width / newWidth;
      const zoomY = height / newHeight;
      const newZoom = Math.max(zoomX, zoomY);

      // Set initial zoom only if it hasn't been set before (i.e., it's the default 1)
      if (allEditSettings[currentImageIndex]?.zoom === 1) {
        setCurrentEditSettings((prev) => ({ ...prev, zoom: newZoom }));
      }
    },
    [allEditSettings, currentImageIndex, setCurrentEditSettings]
  );

  useEffect(() => {
    if (editorAssets.length > 0) {
      const currentAsset = editorAssets[currentImageIndex];
      const url = currentAsset.file
        ? URL.createObjectURL(currentAsset.file)
        : signedUrls[currentAsset.asset_url] || currentAsset.asset_url;
      if (url) {
        setImgSrc(url);
      }
    }
  }, [editorAssets, currentImageIndex, signedUrls]);

  useEffect(() => {
    if (editorAssets.length > 0 && allEditSettings.length !== editorAssets.length) {
      setAllEditSettings(editorAssets.map(() => ({ ...defaultSettings })));
    }
  }, [editorAssets, allEditSettings.length]);

  useEffect(() => {
    const currentCrop = allEditSettings[currentImageIndex]?.crop;
    if (currentCrop) {
      const targetWidth = 1080;
      const targetHeight = 1920;
      const estimated = (targetWidth * targetHeight * editSettings.compression) / 1024 / 3; // Rough estimate for JPEG
      setEstimatedSize(Math.round(estimated));
    }
  }, [editSettings.compression, allEditSettings, currentImageIndex]);

  const currentAsset = editorAssets[currentImageIndex];
  if (!currentAsset) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-7xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Modify Images</h3>
            <Button className="w-full" onClick={handleRandomize}>
              Randomize
            </Button>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="randomize-tint"
                  checked={randomizeOptions.tintAmount}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, tintAmount: !!checked }))}
                />
                <Label htmlFor="tint" className="flex-1">
                  Tint
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="tint"
                  type="color"
                  value={editSettings.tint}
                  onChange={(e) => setCurrentEditSettings((s) => ({ ...s, tint: e.target.value }))}
                  className="w-8 h-8 p-0 border-0 bg-transparent"
                />
                <Slider
                  value={[editSettings.tintAmount]}
                  onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, tintAmount: value }))}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-compression"
                  checked={randomizeOptions.compression}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, compression: !!checked }))}
                />
                <Label htmlFor="randomize-compression" className="flex-1">
                  Compression: {editSettings.compression.toFixed(2)} (~{estimatedSize} KB)
                </Label>
              </div>
              <Slider
                value={[editSettings.compression]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, compression: value }))}
                min={0.1}
                max={1}
                step={0.01}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-brightness"
                  checked={randomizeOptions.brightness}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, brightness: !!checked }))}
                />
                <Label htmlFor="randomize-brightness" className="flex-1">
                  Brightness: {editSettings.brightness.toFixed(2)}
                </Label>
              </div>
              <Slider
                value={[editSettings.brightness]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, brightness: value }))}
                min={0.5}
                max={1.5}
                step={0.01}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-contrast"
                  checked={randomizeOptions.contrast}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, contrast: !!checked }))}
                />
                <Label htmlFor="randomize-contrast" className="flex-1">
                  Contrast: {editSettings.contrast.toFixed(2)}
                </Label>
              </div>
              <Slider
                value={[editSettings.contrast]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, contrast: value }))}
                min={0.5}
                max={1.5}
                step={0.01}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-noise"
                  checked={randomizeOptions.noise}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, noise: !!checked }))}
                />
                <Label htmlFor="randomize-noise" className="flex-1">
                  Noise: {editSettings.noise}
                </Label>
              </div>
              <Slider
                value={[editSettings.noise]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, noise: value }))}
                min={0}
                max={50}
                step={1}
              />
              <p className="text-xs text-gray-500">Applied on save.</p>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-opacity"
                  checked={randomizeOptions.opacity}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, opacity: !!checked }))}
                />
                <Label htmlFor="randomize-opacity" className="flex-1">
                  Opacity: {editSettings.opacity.toFixed(2)}
                </Label>
              </div>
              <Slider
                value={[editSettings.opacity]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, opacity: value }))}
                min={0}
                max={1}
                step={0.01}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-hue"
                  checked={randomizeOptions.hue}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, hue: !!checked }))}
                />
                <Label htmlFor="randomize-hue" className="flex-1">
                  Hue: {editSettings.hue}
                </Label>
              </div>
              <Slider
                value={[editSettings.hue]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, hue: value }))}
                min={-20}
                max={20}
                step={1}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-rotation"
                  checked={randomizeOptions.rotation}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, rotation: !!checked }))}
                />
                <Label htmlFor="randomize-rotation" className="flex-1">
                  Rotation: {editSettings.rotation.toFixed(1)}°
                </Label>
              </div>
              <Slider
                value={[editSettings.rotation]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, rotation: value }))}
                min={-5}
                max={5}
                step={0.1}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-temperature"
                  checked={randomizeOptions.temperature}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, temperature: !!checked }))}
                />
                <Label htmlFor="randomize-temperature" className="flex-1">
                  Temperature: {editSettings.temperature.toFixed(0)}
                </Label>
              </div>
              <Slider
                value={[editSettings.temperature]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, temperature: value }))}
                min={-50}
                max={50}
                step={1}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-vignette"
                  checked={randomizeOptions.vignette}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, vignette: !!checked }))}
                />
                <Label htmlFor="randomize-vignette" className="flex-1">
                  Vignette: {editSettings.vignette.toFixed(2)}
                </Label>
              </div>
              <Slider
                value={[editSettings.vignette]}
                onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, vignette: value }))}
                min={0}
                max={1}
                step={0.05}
              />

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="randomize-flip"
                  checked={randomizeOptions.flipHorizontal}
                  onCheckedChange={(checked) => setRandomizeOptions((prev) => ({ ...prev, flipHorizontal: !!checked }))}
                />
                <Label htmlFor="randomize-flip" className="flex-1">
                  Flip Horizontal
                </Label>
                <Button
                  onClick={() => setCurrentEditSettings((s) => ({ ...s, flipHorizontal: !s.flipHorizontal }))}
                  variant={editSettings.flipHorizontal ? "secondary" : "outline"}>
                  {editSettings.flipHorizontal ? "On" : "Off"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 pt-2">
              These tools subtly change the image to help avoid detection when reposting. All metadata is cleared on
              save.
            </p>
          </div>
          <div className="md:col-span-2 relative h-[600px]">
            {imgSrc && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    filter: `hue-rotate(${editSettings.hue}deg) contrast(${editSettings.contrast}) brightness(${editSettings.brightness}) opacity(${editSettings.opacity})`,
                    transform: `scaleX(${editSettings.flipHorizontal ? -1 : 1}) rotate(${editSettings.rotation}deg)`,
                  }}>
                  <Cropper
                    key={imgSrc}
                    image={imgSrc}
                    crop={crop}
                    zoom={editSettings.zoom}
                    aspect={9 / 16}
                    initialCroppedAreaPixels={currentAsset.editSettings?.crop}
                    onCropChange={setCropState}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropComplete}
                    onMediaLoaded={onMediaLoaded}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: editSettings.tint,
                    opacity: editSettings.tintAmount * 0.5,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor:
                      editSettings.temperature > 0
                        ? `rgba(255, 165, 0, ${editSettings.temperature / 250})`
                        : `rgba(0, 0, 255, ${-editSettings.temperature / 250})`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    boxShadow: `inset 0 0 ${editSettings.vignette * 150}px rgba(0,0,0,${editSettings.vignette * 0.5})`,
                    pointerEvents: "none",
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <div className="grid grid-cols-3 gap-2">
              {editorAssets.map((asset, index) => {
                const thumbnailUrl = asset.file
                  ? URL.createObjectURL(asset.file)
                  : signedUrls[asset.asset_url] || asset.asset_url;
                if (!thumbnailUrl)
                  return (
                    <div
                      key={asset.id}
                      className="w-full aspect-square object-cover rounded-md bg-gray-200 animate-pulse"
                    />
                  );
                return (
                  <div key={asset.id} className="relative">
                    <img
                      src={thumbnailUrl}
                      alt={`Thumbnail ${index}`}
                      className={`w-full aspect-square object-cover rounded-md cursor-pointer ${
                        index === currentImageIndex ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                    {index === currentImageIndex && (
                      <div className="absolute bottom-1 right-1 flex gap-1">
                        <Button size="sm" variant="destructive" onClick={() => removeEditorAsset(asset.id)}>
                          X
                        </Button>
                        <Button size="sm" asChild>
                          <label htmlFor={`replace-${asset.id}`}>R</label>
                        </Button>
                        <input
                          type="file"
                          id={`replace-${asset.id}`}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              replaceEditorAsset(asset.id, e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div></div>
          <div>
            <Button onClick={closeEditor} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleRandomizeAll} variant="outline" className="ml-2">
              Randomize All
            </Button>
            <Button onClick={handleFinish} className="ml-2">
              Finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModifier;
