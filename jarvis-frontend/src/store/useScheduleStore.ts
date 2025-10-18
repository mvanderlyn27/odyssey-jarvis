import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ScheduleState {
  morningTime: string;
  eveningTime: string;
  setMorningTime: (time: string) => void;
  setEveningTime: (time: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      morningTime: "09:00",
      eveningTime: "18:00",
      setMorningTime: (time) => set({ morningTime: time }),
      setEveningTime: (time) => set({ eveningTime: time }),
    }),
    {
      name: "schedule-storage",
    }
  )
);
