import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PostWithAssets } from "../features/posts/types";

interface DaySettings {
  morning: string;
  evening: string;
}

interface SchedulePageState {
  draftPosts: PostWithAssets[];
  scheduledPosts: PostWithAssets[];
  daySettings: Record<string, DaySettings>;
  overallMorningTime: string;
  overallEveningTime: string;
  editIndividually: boolean;
  setDraftPosts: (posts: PostWithAssets[]) => void;
  setScheduledPosts: (posts: PostWithAssets[]) => void;
  movePostToSchedule: (postId: string, scheduleDate: string, accountId: string) => void;
  movePostToDrafts: (postId: string) => void;
  setDayTime: (day: string, period: "morning" | "evening", time: string) => void;
  setAllDaysTime: (period: "morning" | "evening", time: string) => void;
  setOverallMorningTime: (time: string) => void;
  setOverallEveningTime: (time: string) => void;
  setEditIndividually: (edit: boolean) => void;
}

const initialDaySettings = {
  Mon: { morning: "09:00", evening: "17:00" },
  Tue: { morning: "09:00", evening: "17:00" },
  Wed: { morning: "09:00", evening: "17:00" },
  Thu: { morning: "09:00", evening: "17:00" },
  Fri: { morning: "09:00", evening: "17:00" },
  Sat: { morning: "09:00", evening: "17:00" },
  Sun: { morning: "09:00", evening: "17:00" },
};

export const useSchedulePageStore = create<SchedulePageState>()(
  persist(
    (set) => ({
      draftPosts: [],
      scheduledPosts: [],
      daySettings: initialDaySettings,
      overallMorningTime: "09:00",
      overallEveningTime: "17:00",
      editIndividually: false,
      setDraftPosts: (posts) => set({ draftPosts: posts }),
      setScheduledPosts: (posts) => set({ scheduledPosts: posts }),
      movePostToSchedule: (postId, scheduleDate, accountId) =>
        set((state) => {
          let postToMove = state.draftPosts.find((p) => p.id === postId);
          if (postToMove) {
            // Moving from drafts to schedule
            return {
              draftPosts: state.draftPosts.filter((p) => p.id !== postId),
              scheduledPosts: [
                ...state.scheduledPosts,
                { ...postToMove, scheduled_at: scheduleDate, tiktok_account_id: accountId, status: "SCHEDULED" },
              ],
            };
          } else {
            // Moving within the schedule (rescheduling)
            postToMove = state.scheduledPosts.find((p) => p.id === postId);
            if (!postToMove) return state;

            return {
              ...state,
              scheduledPosts: state.scheduledPosts.map((p) =>
                p.id === postId ? { ...p, scheduled_at: scheduleDate, tiktok_account_id: accountId } : p
              ),
            };
          }
        }),
      movePostToDrafts: (postId) =>
        set((state) => {
          const postToMove = state.scheduledPosts.find((p) => p.id === postId);
          if (!postToMove) return state;

          return {
            scheduledPosts: state.scheduledPosts.filter((p) => p.id !== postId),
            draftPosts: [...state.draftPosts, { ...postToMove, scheduled_at: null, status: "DRAFT" }],
          };
        }),
      setDayTime: (day, period, time) =>
        set((state) => ({
          daySettings: {
            ...state.daySettings,
            [day]: { ...state.daySettings[day], [period]: time },
          },
        })),
      setAllDaysTime: (period, time) =>
        set((state) => {
          const newDaySettings = { ...state.daySettings };
          for (const day in newDaySettings) {
            newDaySettings[day] = { ...newDaySettings[day], [period]: time };
          }
          return { daySettings: newDaySettings };
        }),
      setOverallMorningTime: (time) => set({ overallMorningTime: time }),
      setOverallEveningTime: (time) => set({ overallEveningTime: time }),
      setEditIndividually: (edit) => set({ editIndividually: edit }),
    }),
    {
      name: "schedule-page-storage",
      partialize: (state) => ({
        daySettings: state.daySettings,
        overallMorningTime: state.overallMorningTime,
        overallEveningTime: state.overallEveningTime,
        editIndividually: state.editIndividually,
      }),
    }
  )
);
