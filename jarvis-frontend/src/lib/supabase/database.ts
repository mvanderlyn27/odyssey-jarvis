export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_analytics: {
        Row: {
          created_at: string
          follower_count: number
          following_count: number
          id: number
          likes_count: number
          tiktok_account_id: string
          video_count: number
        }
        Insert: {
          created_at?: string
          follower_count: number
          following_count: number
          id?: number
          likes_count: number
          tiktok_account_id: string
          video_count: number
        }
        Update: {
          created_at?: string
          follower_count?: number
          following_count?: number
          id?: number
          likes_count?: number
          tiktok_account_id?: string
          video_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_analytics_tiktok_account_id_fkey"
            columns: ["tiktok_account_id"]
            isOneToOne: false
            referencedRelation: "tiktok_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_analytics: {
        Row: {
          comments: number | null
          created_at: string
          id: string
          likes: number | null
          post_id: string | null
          shares: number | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          id?: string
          likes?: number | null
          post_id?: string | null
          shares?: number | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          id?: string
          likes?: number | null
          post_id?: string | null
          shares?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_assets: {
        Row: {
          asset_type: string
          asset_url: string
          blurhash: string | null
          created_at: string | null
          id: string
          order: number
          post_id: string | null
          thumbnail_path: string | null
        }
        Insert: {
          asset_type: string
          asset_url: string
          blurhash?: string | null
          created_at?: string | null
          id?: string
          order: number
          post_id?: string | null
          thumbnail_path?: string | null
        }
        Update: {
          asset_type?: string
          asset_url?: string
          blurhash?: string | null
          created_at?: string | null
          id?: string
          order?: number
          post_id?: string | null
          thumbnail_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_assets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          created_at: string
          created_in_jarvis: boolean | null
          description: string | null
          id: string
          post_id: string | null
          post_url: string | null
          reason: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          tiktok_account_id: string | null
          tiktok_embed_url: string | null
          tiktok_publish_id: string | null
          tiktok_share_url: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          created_in_jarvis?: boolean | null
          description?: string | null
          id?: string
          post_id?: string | null
          post_url?: string | null
          reason?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tiktok_account_id?: string | null
          tiktok_embed_url?: string | null
          tiktok_publish_id?: string | null
          tiktok_share_url?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          created_in_jarvis?: boolean | null
          description?: string | null
          id?: string
          post_id?: string | null
          post_url?: string | null
          reason?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tiktok_account_id?: string | null
          tiktok_embed_url?: string | null
          tiktok_publish_id?: string | null
          tiktok_share_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_tiktok_account_id_fkey"
            columns: ["tiktok_account_id"]
            isOneToOne: false
            referencedRelation: "tiktok_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_accounts: {
        Row: {
          access_token: string
          created_at: string | null
          expires_in: number
          id: string
          refresh_expires_in: number
          refresh_token: string
          scope: string | null
          tiktok_avatar_url: string | null
          tiktok_display_name: string | null
          tiktok_open_id: string
          tiktok_username: string | null
          token_status: Database["public"]["Enums"]["tiktok_account_status"]
          token_type: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_in: number
          id?: string
          refresh_expires_in: number
          refresh_token: string
          scope?: string | null
          tiktok_avatar_url?: string | null
          tiktok_display_name?: string | null
          tiktok_open_id: string
          tiktok_username?: string | null
          token_status?: Database["public"]["Enums"]["tiktok_account_status"]
          token_type?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_in?: number
          id?: string
          refresh_expires_in?: number
          refresh_token?: string
          scope?: string | null
          tiktok_avatar_url?: string | null
          tiktok_display_name?: string | null
          tiktok_open_id?: string
          tiktok_username?: string | null
          token_status?: Database["public"]["Enums"]["tiktok_account_status"]
          token_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_kpis: {
        Args:
          | { p_account_ids: string[] }
          | {
              p_account_ids: string[]
              p_end_date: string
              p_start_date: string
            }
        Returns: {
          date: string
          total_comments: number
          total_likes: number
          total_shares: number
          total_views: number
        }[]
      }
      get_latest_account_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_id: string
          created_at: string
          follower_count: number
          following_count: number
          likes_count: number
          video_count: number
        }[]
      }
      invoke_fetch_post_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      invoke_publish_scheduled_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      asset_type: "videos" | "slides"
      draft_status: "DRAFT" | "PUBLISHED" | "FAILED"
      post_status:
        | "DRAFT"
        | "PROCESSING"
        | "PUBLISHED"
        | "FAILED"
        | "INBOX"
        | "SCHEDULED"
      tiktok_account_status: "active" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      asset_type: ["videos", "slides"],
      draft_status: ["DRAFT", "PUBLISHED", "FAILED"],
      post_status: [
        "DRAFT",
        "PROCESSING",
        "PUBLISHED",
        "FAILED",
        "INBOX",
        "SCHEDULED",
      ],
      tiktok_account_status: ["active", "expired"],
    },
  },
} as const
