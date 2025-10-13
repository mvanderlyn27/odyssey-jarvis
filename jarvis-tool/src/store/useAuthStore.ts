import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  tiktokCodeVerifier: string | null;
  setTikTokCodeVerifier: (codeVerifier: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      tiktokCodeVerifier: null,
      setTikTokCodeVerifier: (tiktokCodeVerifier) => set({ tiktokCodeVerifier }),
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
    }
  )
);
