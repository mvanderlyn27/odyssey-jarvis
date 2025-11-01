import { Database, Tables } from "@/lib/supabase/database";

export type PostAsset = Tables<"post_assets">;
export type PostAnalytics = Tables<"post_analytics">;

export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Asset = PostAsset & {
  status: "new" | "deleted" | "modified" | "unchanged";
  file?: File;
  originalFile?: File;
  editSettings?: {
    crop?: CroppedArea;
    zoom?: number;
    rotation?: number;
    thumbnail?: File;
  };
};

export type Post = Tables<"posts"> & {
  post_assets: PostAsset[];
  post_analytics?: PostAnalytics[];
  tiktok_accounts: {
    tiktok_display_name: string | null;
    tiktok_avatar_url: string | null;
  } | null;
};

export type DraftPost = Omit<Post, "post_assets"> & {
  post_assets: Asset[];
};

export type PostWithAssets = Database["public"]["Tables"]["posts"]["Row"] & {
  post_assets: PostAsset[];
};

export type PostStatus = Database["public"]["Enums"]["post_status"];
