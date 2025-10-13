import { Tables } from "@/lib/supabase/database";

export type TikTokAccount = Tables<"tiktok_accounts">;

export interface TikTokVideo {
  id: string;
  title: string;
  video_description: string;
  duration: number;
  cover_image_url: string;
  embed_link: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  create_time: number;
}

export interface TikTokVideoListResponse {
  data: {
    videos: { id: string }[];
    cursor: string | null;
    has_more: boolean;
  };
}
