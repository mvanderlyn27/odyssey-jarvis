import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export const processVideo = async (videoFile: File): Promise<File> => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL("/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js", "text/javascript"),
      wasmURL: await toBlobURL("/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm", "application/wasm"),
    });
  }

  await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

  // Example processing: resize to 720p and compress
  await ffmpeg.exec(["-i", "input.mp4", "-vf", "scale=1280:720", "-preset", "fast", "-crf", "28", "output.mp4"]);

  const data = await ffmpeg.readFile("output.mp4");
  const blob = new Blob([data as any], { type: "video/mp4" });
  const processedFile = new File([blob], "processed-video.mp4", { type: "video/mp4" });

  return processedFile;
};

export const generateVideoThumbnail = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadeddata = () => {
      video.currentTime = 0;
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], "thumbnail.jpg", { type: "image/jpeg" }));
          } else {
            reject(new Error("Canvas to Blob conversion failed"));
          }
        }, "image/jpeg");
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    video.onerror = (err) => {
      reject(err);
    };
  });
};
