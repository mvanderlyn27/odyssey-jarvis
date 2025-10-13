import { create } from "zustand";

interface AnalyticsState {
  selectedAccountIds: string[];
  setSelectedAccountIds: (accountIds: string[]) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  selectedAccountIds: [],
  setSelectedAccountIds: (accountIds) => set({ selectedAccountIds: accountIds }),
}));
