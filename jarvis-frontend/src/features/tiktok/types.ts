import { Tables } from "@/lib/supabase/database";

export type TikTokAccount = Tables<"tiktok_accounts"> & {
  is_stale: boolean;
};
