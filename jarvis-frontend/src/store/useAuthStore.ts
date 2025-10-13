import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  tiktokCodeVerifier: string | null;
  setTikTokCodeVerifier: (codeVerifier: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      loading: true,
      setSession: (session) => set({ session, loading: false }),
      setLoading: (loading) => set({ loading }),
      tiktokCodeVerifier: null,
      setTikTokCodeVerifier: (tiktokCodeVerifier) => set({ tiktokCodeVerifier }),
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
    }
  )
);
