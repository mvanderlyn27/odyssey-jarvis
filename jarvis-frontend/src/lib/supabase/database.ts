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
      account_analytics_daily: {
        Row: {
          account_id: string
          created_at: string
          fetched_at: string
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          id: number
          likes_count: number
          likes_count_delta: number
          organization_id: string | null
          tiktok_account_id: string
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          user_id: string | null
          video_count: number
          video_count_delta: number
        }
        Insert: {
          account_id: string
          created_at: string
          fetched_at: string
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          id: number
          likes_count: number
          likes_count_delta: number
          organization_id?: string | null
          tiktok_account_id: string
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          user_id?: string | null
          video_count: number
          video_count_delta: number
        }
        Update: {
          account_id?: string
          created_at?: string
          fetched_at?: string
          follower_count?: number
          follower_count_delta?: number
          following_count?: number
          following_count_delta?: number
          id?: number
          likes_count?: number
          likes_count_delta?: number
          organization_id?: string | null
          tiktok_account_id?: string
          total_post_comments?: number
          total_post_comments_delta?: number
          total_post_likes?: number
          total_post_likes_delta?: number
          total_post_shares?: number
          total_post_shares_delta?: number
          total_post_views?: number
          total_post_views_delta?: number
          user_id?: string | null
          video_count?: number
          video_count_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      account_analytics_hourly: {
        Row: {
          account_id: string
          created_at: string
          fetched_at: string
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          id: number
          likes_count: number
          likes_count_delta: number
          organization_id: string | null
          tiktok_account_id: string
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          user_id: string | null
          video_count: number
          video_count_delta: number
        }
        Insert: {
          account_id: string
          created_at: string
          fetched_at: string
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          id: number
          likes_count: number
          likes_count_delta: number
          organization_id?: string | null
          tiktok_account_id: string
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          user_id?: string | null
          video_count: number
          video_count_delta: number
        }
        Update: {
          account_id?: string
          created_at?: string
          fetched_at?: string
          follower_count?: number
          follower_count_delta?: number
          following_count?: number
          following_count_delta?: number
          id?: number
          likes_count?: number
          likes_count_delta?: number
          organization_id?: string | null
          tiktok_account_id?: string
          total_post_comments?: number
          total_post_comments_delta?: number
          total_post_likes?: number
          total_post_likes_delta?: number
          total_post_shares?: number
          total_post_shares_delta?: number
          total_post_views?: number
          total_post_views_delta?: number
          user_id?: string | null
          video_count?: number
          video_count_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      account_analytics_monthly: {
        Row: {
          account_id: string
          created_at: string
          fetched_at: string
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          id: number
          likes_count: number
          likes_count_delta: number
          organization_id: string | null
          tiktok_account_id: string
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          user_id: string | null
          video_count: number
          video_count_delta: number
        }
        Insert: {
          account_id: string
          created_at: string
          fetched_at: string
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          id: number
          likes_count: number
          likes_count_delta: number
          organization_id?: string | null
          tiktok_account_id: string
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          user_id?: string | null
          video_count: number
          video_count_delta: number
        }
        Update: {
          account_id?: string
          created_at?: string
          fetched_at?: string
          follower_count?: number
          follower_count_delta?: number
          following_count?: number
          following_count_delta?: number
          id?: number
          likes_count?: number
          likes_count_delta?: number
          organization_id?: string | null
          tiktok_account_id?: string
          total_post_comments?: number
          total_post_comments_delta?: number
          total_post_likes?: number
          total_post_likes_delta?: number
          total_post_shares?: number
          total_post_shares_delta?: number
          total_post_views?: number
          total_post_views_delta?: number
          user_id?: string | null
          video_count?: number
          video_count_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      account_analytics_raw: {
        Row: {
          account_id: string | null
          created_at: string
          fetched_at: string | null
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          id: number
          likes_count: number
          likes_count_delta: number
          organization_id: string | null
          tiktok_account_id: string
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          user_id: string | null
          video_count: number
          video_count_delta: number
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          fetched_at?: string | null
          follower_count: number
          follower_count_delta?: number
          following_count: number
          following_count_delta?: number
          id?: number
          likes_count: number
          likes_count_delta?: number
          organization_id?: string | null
          tiktok_account_id: string
          total_post_comments?: number
          total_post_comments_delta?: number
          total_post_likes?: number
          total_post_likes_delta?: number
          total_post_shares?: number
          total_post_shares_delta?: number
          total_post_views?: number
          total_post_views_delta?: number
          user_id?: string | null
          video_count: number
          video_count_delta?: number
        }
        Update: {
          account_id?: string | null
          created_at?: string
          fetched_at?: string | null
          follower_count?: number
          follower_count_delta?: number
          following_count?: number
          following_count_delta?: number
          id?: number
          likes_count?: number
          likes_count_delta?: number
          organization_id?: string | null
          tiktok_account_id?: string
          total_post_comments?: number
          total_post_comments_delta?: number
          total_post_likes?: number
          total_post_likes_delta?: number
          total_post_shares?: number
          total_post_shares_delta?: number
          total_post_views?: number
          total_post_views_delta?: number
          user_id?: string | null
          video_count?: number
          video_count_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_analytics_tiktok_account_id_fkey"
            columns: ["tiktok_account_id"]
            isOneToOne: false
            referencedRelation: "tiktok_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by_user_id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          status: Database["public"]["Enums"]["invite_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by_user_id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by_user_id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features: Json
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      post_analytics_daily: {
        Row: {
          comments: number | null
          created_at: string
          fetched_at: string
          id: string
          likes: number | null
          organization_id: string | null
          post_id: string
          shares: number | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at: string
          fetched_at: string
          id: string
          likes?: number | null
          organization_id?: string | null
          post_id: string
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          fetched_at?: string
          id?: string
          likes?: number | null
          organization_id?: string | null
          post_id?: string
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_analytics_hourly: {
        Row: {
          comments: number | null
          created_at: string
          fetched_at: string
          id: string
          likes: number | null
          organization_id: string | null
          post_id: string
          shares: number | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at: string
          fetched_at: string
          id: string
          likes?: number | null
          organization_id?: string | null
          post_id: string
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          fetched_at?: string
          id?: string
          likes?: number | null
          organization_id?: string | null
          post_id?: string
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_analytics_monthly: {
        Row: {
          comments: number | null
          created_at: string
          fetched_at: string
          id: string
          likes: number | null
          organization_id: string | null
          post_id: string
          shares: number | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at: string
          fetched_at: string
          id: string
          likes?: number | null
          organization_id?: string | null
          post_id: string
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          fetched_at?: string
          id?: string
          likes?: number | null
          organization_id?: string | null
          post_id?: string
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_analytics_raw: {
        Row: {
          comments: number | null
          created_at: string
          fetched_at: string | null
          id: string
          likes: number | null
          organization_id: string | null
          post_id: string | null
          shares: number | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          fetched_at?: string | null
          id?: string
          likes?: number | null
          organization_id?: string | null
          post_id?: string | null
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          fetched_at?: string | null
          id?: string
          likes?: number | null
          organization_id?: string | null
          post_id?: string | null
          shares?: number | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          asset_type: Database["public"]["Enums"]["asset_type"] | null
          asset_url: string | null
          blurhash: string | null
          created_at: string
          id: string
          post_id: string | null
          sort_order: number | null
          thumbnail_path: string | null
        }
        Insert: {
          asset_type?: Database["public"]["Enums"]["asset_type"] | null
          asset_url?: string | null
          blurhash?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          sort_order?: number | null
          thumbnail_path?: string | null
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"] | null
          asset_url?: string | null
          blurhash?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          sort_order?: number | null
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
          organization_id: string | null
          post_id: string | null
          post_url: string | null
          published_at: string | null
          reason: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          tiktok_account_id: string | null
          tiktok_embed_url: string | null
          tiktok_publish_id: string | null
          tiktok_share_url: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_in_jarvis?: boolean | null
          description?: string | null
          id?: string
          organization_id?: string | null
          post_id?: string | null
          post_url?: string | null
          published_at?: string | null
          reason?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tiktok_account_id?: string | null
          tiktok_embed_url?: string | null
          tiktok_publish_id?: string | null
          tiktok_share_url?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_in_jarvis?: boolean | null
          description?: string | null
          id?: string
          organization_id?: string | null
          post_id?: string | null
          post_url?: string | null
          published_at?: string | null
          reason?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tiktok_account_id?: string | null
          tiktok_embed_url?: string | null
          tiktok_publish_id?: string | null
          tiktok_share_url?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_tiktok_account_id_fkey"
            columns: ["tiktok_account_id"]
            isOneToOne: false
            referencedRelation: "tiktok_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["organization_role"]
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_role"]
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_ends_at: string | null
          end_date: string | null
          id: string
          organization_id: string | null
          plan_id: string | null
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          trial_starts_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_ends_at?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          plan_id?: string | null
          start_date: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_ends_at?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_account_analytics: {
        Row: {
          created_at: string | null
          follower_count: number | null
          following_count: number | null
          id: string
          likes_count: number | null
          tiktok_account_id: string | null
          video_count: number | null
        }
        Insert: {
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          likes_count?: number | null
          tiktok_account_id?: string | null
          video_count?: number | null
        }
        Update: {
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          likes_count?: number | null
          tiktok_account_id?: string | null
          video_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_account_analytics_tiktok_account_id_fkey"
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
          created_at: string
          display_name: string | null
          id: string
          last_analytics_sync_at: string | null
          last_video_import_at: string | null
          open_id: string | null
          organization_id: string | null
          profile_image_url: string | null
          refresh_token: string | null
          scope: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          display_name?: string | null
          id?: string
          last_analytics_sync_at?: string | null
          last_video_import_at?: string | null
          open_id?: string | null
          organization_id?: string | null
          profile_image_url?: string | null
          refresh_token?: string | null
          scope?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          display_name?: string | null
          id?: string
          last_analytics_sync_at?: string | null
          last_video_import_at?: string | null
          open_id?: string | null
          organization_id?: string | null
          profile_image_url?: string | null
          refresh_token?: string | null
          scope?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aggregate_account_analytics: { Args: never; Returns: undefined }
      aggregate_post_analytics: { Args: never; Returns: undefined }
      get_account_analytics_history: {
        Args: {
          end_date: string
          p_account_id: string
          p_granularity: string
          start_date: string
        }
        Returns: {
          time_bucket: string
          total_comments: number
          total_followers: number
          total_likes: number
          total_shares: number
          total_views: number
        }[]
      }
      get_daily_kpis: {
        Args: {
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
        Args: never
        Returns: {
          account_id: string
          created_at: string
          follower_count: number
          follower_count_delta: number
          following_count: number
          following_count_delta: number
          likes_count: number
          likes_count_delta: number
          total_post_comments: number
          total_post_comments_delta: number
          total_post_likes: number
          total_post_likes_delta: number
          total_post_shares: number
          total_post_shares_delta: number
          total_post_views: number
          total_post_views_delta: number
          video_count: number
          video_count_delta: number
        }[]
      }
      get_my_organization_id: { Args: never; Returns: string }
      purge_old_analytics_data: { Args: never; Returns: undefined }
    }
    Enums: {
      asset_type: "videos" | "slides"
      invite_status: "pending" | "accepted" | "declined"
      organization_role: "owner" | "member"
      post_status:
        | "DRAFT"
        | "PROCESSING"
        | "PUBLISHED"
        | "FAILED"
        | "INBOX"
        | "SCHEDULED"
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
      invite_status: ["pending", "accepted", "declined"],
      organization_role: ["owner", "member"],
      post_status: [
        "DRAFT",
        "PROCESSING",
        "PUBLISHED",
        "FAILED",
        "INBOX",
        "SCHEDULED",
      ],
    },
  },
} as const
