import { create } from "zustand";
import { Crop } from "react-image-crop";

type ImageEditorState = {
  files: File[];
  crops: Crop[];
  croppedImages: (Blob | null)[];
  currentImageIndex: number;
  setFiles: (files: File[]) => void;
  setCrop: (index: number, crop: Crop) => void;
  setCroppedImage: (index: number, blob: Blob) => void;
  setCurrentImageIndex: (index: number) => void;
  reset: () => void;
};

const initialState = {
  files: [],
  crops: [],
  croppedImages: [],
  currentImageIndex: 0,
};

export const useImageEditorStore = create<ImageEditorState>((set) => ({
  ...initialState,
  setFiles: (files) =>
    set({
      files,
      crops: new Array(files.length).fill({
        unit: "%",
        width: 100,
        height: 100,
        x: 0,
        y: 0,
      }),
      croppedImages: new Array(files.length).fill(null),
      currentImageIndex: 0,
    }),
  setCrop: (index, crop) =>
    set((state) => {
      const newCrops = [...state.crops];
      newCrops[index] = crop;
      return { crops: newCrops };
    }),
  setCroppedImage: (index, blob) =>
    set((state) => {
      const newCroppedImages = [...state.croppedImages];
      newCroppedImages[index] = blob;
      return { croppedImages: newCroppedImages };
    }),
  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
  reset: () => set(initialState),
}));
