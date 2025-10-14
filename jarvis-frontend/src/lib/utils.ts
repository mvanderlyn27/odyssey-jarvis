import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Area } from "react-easy-crop";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  settings: {
    rotation: number;
    flipHorizontal: boolean;
    opacity: number;
    hue: number;
    contrast: number;
    brightness: number;
    tint: string;
    tintAmount: number;
    temperature: number;
    vignette: number;
    noise: number;
    compression: number;
  }
): Promise<Blob> => {
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

  if (settings.temperature !== 0) {
    const temp = settings.temperature;
    const r = temp > 0 ? temp * 2.55 : 0;
    const b = temp < 0 ? -temp * 2.55 : 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(${r}, 0, ${b}, 0.1)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

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
      const noise = (Math.random() - 0.5) * settings.noise * 4;
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

export const getRandomCrop = (): Area => {
  const CROP_WIDTH = 1080;
  const CROP_HEIGHT = 1920;
  const CROP_ASPECT = CROP_WIDTH / CROP_HEIGHT;

  const imageWidth = 2000;
  const imageHeight = 2500;
  const imageAspect = imageWidth / imageHeight;

  let width, height, x, y;

  if (imageAspect > CROP_ASPECT) {
    height = imageHeight;
    width = height * CROP_ASPECT;
    x = (imageWidth - width) * Math.random();
    y = 0;
  } else {
    width = imageWidth;
    height = width / CROP_ASPECT;
    x = 0;
    y = (imageHeight - height) * Math.random();
  }

  return {
    width,
    height,
    x,
    y,
  };
};

export const getRandomEditSettings = () => {
  const randomRotation = Math.random() * 2 - 1;
  const randomZoom = 1;
  const randomFlip = Math.random() > 0.5;
  const randomTintAmount = Math.random() * 0.2;
  const randomHue = Math.floor(Math.random() * 361);
  const randomContrast = 1 + (Math.random() * 0.1 - 0.05);
  const randomBrightness = 1 + (Math.random() * 0.1 - 0.05);
  const randomTemperature = Math.random() * 20 - 10;
  const randomVignette = Math.random() * 0.2;
  const randomNoise = Math.floor(Math.random() * 11);

  return {
    rotation: randomRotation,
    zoom: randomZoom,
    flipHorizontal: randomFlip,
    tintAmount: randomTintAmount,
    hue: randomHue,
    contrast: randomContrast,
    brightness: randomBrightness,
    temperature: randomTemperature,
    vignette: randomVignette,
    noise: randomNoise,
    cropCoordinates: getRandomCrop(),
  };
};
