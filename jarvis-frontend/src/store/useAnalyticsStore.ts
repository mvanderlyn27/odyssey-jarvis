import { create } from "zustand";
import { TikTokAccount } from "@/features/tiktok/types";

interface AnalyticsState {
  selectedAccounts: TikTokAccount[];
  setSelectedAccounts: (accounts: TikTokAccount[]) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  selectedAccounts: [],
  setSelectedAccounts: (accounts) => set({ selectedAccounts: accounts }),
}));
