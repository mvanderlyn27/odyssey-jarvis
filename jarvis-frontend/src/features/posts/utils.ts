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
