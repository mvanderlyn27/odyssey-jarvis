import { create } from "zustand";
import { Post } from "../features/posts/types";

interface SchedulePageState {
  draftPosts: Post[];
  scheduledPosts: Post[];
  setDraftPosts: (posts: Post[]) => void;
  setScheduledPosts: (posts: Post[]) => void;
  movePostToSchedule: (postId: string, scheduleDate: string, accountId: string) => void;
  movePostToDrafts: (postId: string) => void;
}

export const useSchedulePageStore = create<SchedulePageState>((set) => ({
  draftPosts: [],
  scheduledPosts: [],
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
}));
