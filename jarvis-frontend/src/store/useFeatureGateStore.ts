import { create } from "zustand";
import { Feature } from "@/features/billing/types";

interface FeatureGateStore {
  isModalOpen: boolean;
  feature: Feature | null;
  openModal: (feature: Feature) => void;
  closeModal: () => void;
}

export const useFeatureGateStore = create<FeatureGateStore>((set) => ({
  isModalOpen: false,
  feature: null,
  openModal: (feature) => set({ isModalOpen: true, feature }),
  closeModal: () => set({ isModalOpen: false, feature: null }),
}));
