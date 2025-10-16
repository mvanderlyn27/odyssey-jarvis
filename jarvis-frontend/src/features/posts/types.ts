import { Tables } from "@/lib/supabase/database";

export type PostAsset = Tables<"post_assets">;
export type PostAnalytics = Tables<"post_analytics">;

export type Post = Tables<"posts"> & {
  post_assets: PostAsset[];
  post_analytics: PostAnalytics[];
  tiktok_accounts: {
    tiktok_display_name: string | null;
    tiktok_avatar_url: string | null;
  } | null;
};
