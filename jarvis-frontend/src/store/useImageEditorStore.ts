import { create } from "zustand";
import { CroppedArea } from "@/features/drafts/components/ImageEditor";

type ImageEditorState = {
  files: File[];
  crops: (CroppedArea | undefined)[];
  croppedImages: (Blob | null)[];
  currentImageIndex: number;
  setFiles: (files: File[]) => void;
  setCrop: (index: number, crop: CroppedArea) => void;
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
      crops: new Array(files.length).fill(undefined),
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
