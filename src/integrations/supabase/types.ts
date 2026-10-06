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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          author_title: string
          category: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string
          id: string
          meta_description: string
          publish_date: string
          published: boolean
          read_time: string
          slug: string
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          author_title?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string
          id?: string
          meta_description?: string
          publish_date?: string
          published?: boolean
          read_time?: string
          slug: string
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          author_title?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string
          id?: string
          meta_description?: string
          publish_date?: string
          published?: boolean
          read_time?: string
          slug?: string
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          completion_date: string
          course_name: string
          cpd_hours: number | null
          created_at: string
          credential_level: string | null
          engaged_at: string | null
          external_url: string | null
          id: string
          issued_at: string
          issued_by: string | null
          linkedin_added_at: string | null
          recipient_email: string
          recipient_name: string
          revoke_reason: string | null
          revoked_at: string | null
          status: string
          viewed_at: string | null
        }
        Insert: {
          certificate_number: string
          completion_date: string
          course_name: string
          cpd_hours?: number | null
          created_at?: string
          credential_level?: string | null
          engaged_at?: string | null
          external_url?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          linkedin_added_at?: string | null
          recipient_email: string
          recipient_name: string
          revoke_reason?: string | null
          revoked_at?: string | null
          status?: string
          viewed_at?: string | null
        }
        Update: {
          certificate_number?: string
          completion_date?: string
          course_name?: string
          cpd_hours?: number | null
          created_at?: string
          credential_level?: string | null
          engaged_at?: string | null
          external_url?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          linkedin_added_at?: string | null
          recipient_email?: string
          recipient_name?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          status?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          escalated: boolean
          id: string
          last_message_at: string
          page_url: string | null
          session_id: string
          updated_at: string
          user_agent: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          escalated?: boolean
          id?: string
          last_message_at?: string
          page_url?: string | null
          session_id: string
          updated_at?: string
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          escalated?: boolean
          id?: string
          last_message_at?: string
          page_url?: string | null
          session_id?: string
          updated_at?: string
          user_agent?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_errors: {
        Row: {
          created_at: string
          id: string
          message: string
          screen: string | null
          stack: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          screen?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          screen?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          id: string
          image_url: string | null
          join_url: string | null
          live_now: boolean
          replay_url: string | null
          space: string
          starts_at: string
          stream_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          id?: string
          image_url?: string | null
          join_url?: string | null
          live_now?: boolean
          replay_url?: string | null
          space?: string
          starts_at: string
          stream_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          image_url?: string | null
          join_url?: string | null
          live_now?: boolean
          replay_url?: string | null
          space?: string
          starts_at?: string
          stream_url?: string | null
          title?: string
        }
        Relationships: []
      }
      community_highlights: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          kind: string
          position: number
          space: string
          starts_at: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          position?: number
          space?: string
          starts_at?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          position?: number
          space?: string
          starts_at?: string | null
          title?: string
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          source: string
          space: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          source?: string
          space: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          source?: string
          space?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          media: Json
          pinned: boolean
          space: string
          topic: string
          user_id: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          media?: Json
          pinned?: boolean
          space?: string
          topic?: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          media?: Json
          pinned?: boolean
          space?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      community_reactions: {
        Row: {
          created_at: string
          emoji: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          amount_cents: number
          course_id: string | null
          course_title: string
          currency: string
          customer_business: string | null
          customer_country: string | null
          customer_name: string | null
          customer_vat_id: string | null
          id: string
          purchased_at: string
          receipt_url: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string
          tax_cents: number
          user_id: string
        }
        Insert: {
          amount_cents: number
          course_id?: string | null
          course_title: string
          currency: string
          customer_business?: string | null
          customer_country?: string | null
          customer_name?: string | null
          customer_vat_id?: string | null
          id?: string
          purchased_at?: string
          receipt_url?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id: string
          tax_cents?: number
          user_id: string
        }
        Update: {
          amount_cents?: number
          course_id?: string | null
          course_title?: string
          currency?: string
          customer_business?: string | null
          customer_country?: string | null
          customer_name?: string | null
          customer_vat_id?: string | null
          id?: string
          purchased_at?: string
          receipt_url?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string
          tax_cents?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          cover_image_url: string | null
          cpd_hours: number | null
          created_at: string
          currency: string
          description: string | null
          final_assessment_ref: string | null
          id: string
          playback_settings: Json | null
          price_cents: number
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          cpd_hours?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          final_assessment_ref?: string | null
          id?: string
          playback_settings?: Json | null
          price_cents?: number
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          cpd_hours?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          final_assessment_ref?: string | null
          id?: string
          playback_settings?: Json | null
          price_cents?: number
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_automations: {
        Row: {
          enabled: boolean
          kind: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          kind: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          kind?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          audience: string
          body: string
          failed_count: number
          id: string
          recipient_count: number
          sent_at: string
          sent_by: string | null
          subject: string
        }
        Insert: {
          audience: string
          body: string
          failed_count?: number
          id?: string
          recipient_count?: number
          sent_at?: string
          sent_by?: string | null
          subject: string
        }
        Update: {
          audience?: string
          body?: string
          failed_count?: number
          id?: string
          recipient_count?: number
          sent_at?: string
          sent_by?: string | null
          subject?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          dedupe_key: string
          error: string | null
          id: string
          kind: string
          sent_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          dedupe_key?: string
          error?: string | null
          id?: string
          kind: string
          sent_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          dedupe_key?: string
          error?: string | null
          id?: string
          kind?: string
          sent_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          enrolled_at: string
          expires_at: string | null
          id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          location: string
          published: boolean
          registered: number
          time: string
          title: string
          updated_at: string
          zoom_link: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string
          date: string
          description: string
          id?: string
          image_url?: string | null
          location: string
          published?: boolean
          registered?: number
          time: string
          title: string
          updated_at?: string
          zoom_link?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          location?: string
          published?: boolean
          registered?: number
          time?: string
          title?: string
          updated_at?: string
          zoom_link?: string | null
        }
        Relationships: []
      }
      final_assessment_attempts: {
        Row: {
          assessment_ref: string
          completed_at: string | null
          course_id: string
          created_at: string
          credential_public_id: string | null
          credential_url: string | null
          id: string
          score: number | null
          status: string
          syngraph_attempt_id: string | null
          syngraph_launch_id: string | null
          user_id: string
        }
        Insert: {
          assessment_ref: string
          completed_at?: string | null
          course_id: string
          created_at?: string
          credential_public_id?: string | null
          credential_url?: string | null
          id?: string
          score?: number | null
          status?: string
          syngraph_attempt_id?: string | null
          syngraph_launch_id?: string | null
          user_id: string
        }
        Update: {
          assessment_ref?: string
          completed_at?: string | null
          course_id?: string
          created_at?: string
          credential_public_id?: string | null
          credential_url?: string | null
          id?: string
          score?: number | null
          status?: string
          syngraph_attempt_id?: string | null
          syngraph_launch_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_assessment_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          confirmation_sent_at: string | null
          created_at: string
          email: string
          event_id: string | null
          event_title: string | null
          id: string
          inquiry_type: string | null
          job_title: string | null
          last_contacted_at: string | null
          message: string | null
          name: string
          phone: string | null
          role: string | null
          source: string
          status: string
        }
        Insert: {
          company?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          email: string
          event_id?: string | null
          event_title?: string | null
          id?: string
          inquiry_type?: string | null
          job_title?: string | null
          last_contacted_at?: string | null
          message?: string | null
          name: string
          phone?: string | null
          role?: string | null
          source: string
          status?: string
        }
        Update: {
          company?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          email?: string
          event_id?: string | null
          event_title?: string | null
          id?: string
          inquiry_type?: string | null
          job_title?: string | null
          last_contacted_at?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_activity_days: {
        Row: {
          day: string
          user_id: string
        }
        Insert: {
          day: string
          user_id: string
        }
        Update: {
          day?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          kind: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          kind: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          kind?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "lesson_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          body: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          is_completed: boolean | null
          lesson_id: string
          user_id: string
          watch_duration_seconds: number | null
        }
        Insert: {
          completed_at?: string
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          user_id: string
          watch_duration_seconds?: number | null
        }
        Update: {
          completed_at?: string
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          user_id?: string
          watch_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_watch: {
        Row: {
          duration_seconds: number | null
          last_heartbeat_at: string
          lesson_id: string
          user_id: string
          watched_seconds: number
        }
        Insert: {
          duration_seconds?: number | null
          last_heartbeat_at?: string
          lesson_id: string
          user_id: string
          watched_seconds?: number
        }
        Update: {
          duration_seconds?: number | null
          last_heartbeat_at?: string
          lesson_id?: string
          user_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_watch_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          body: string | null
          captions_path: string | null
          content: string | null
          created_at: string
          duration_minutes: number | null
          enforce_progress: boolean
          id: string
          media_kind: string | null
          media_mime: string | null
          media_name: string | null
          media_path: string | null
          media_size: number | null
          module_id: string
          position: number
          resources: Json
          title: string
          transcript: string | null
          updated_at: string
          video_duration_seconds: number | null
          video_url: string | null
        }
        Insert: {
          body?: string | null
          captions_path?: string | null
          content?: string | null
          created_at?: string
          duration_minutes?: number | null
          enforce_progress?: boolean
          id?: string
          media_kind?: string | null
          media_mime?: string | null
          media_name?: string | null
          media_path?: string | null
          media_size?: number | null
          module_id: string
          position?: number
          resources?: Json
          title: string
          transcript?: string | null
          updated_at?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Update: {
          body?: string | null
          captions_path?: string | null
          content?: string | null
          created_at?: string
          duration_minutes?: number | null
          enforce_progress?: boolean
          id?: string
          media_kind?: string | null
          media_mime?: string | null
          media_name?: string | null
          media_path?: string | null
          media_size?: number | null
          module_id?: string
          position?: number
          resources?: Json
          title?: string
          transcript?: string | null
          updated_at?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          drip_days: number
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          drip_days?: number
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          drip_days?: number
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          browser_version: string | null
          city: string | null
          company: string | null
          country: string | null
          device_type: string | null
          duration: number | null
          id: string
          isp: string | null
          language: string | null
          last_active: string | null
          os: string | null
          page_path: string
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string
          timezone: string | null
          user_agent: string | null
          viewport_height: number | null
          viewport_width: number | null
          visited_at: string | null
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          device_type?: string | null
          duration?: number | null
          id?: string
          isp?: string | null
          language?: string | null
          last_active?: string | null
          os?: string | null
          page_path: string
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id: string
          timezone?: string | null
          user_agent?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          visited_at?: string | null
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          device_type?: string | null
          duration?: number | null
          id?: string
          isp?: string | null
          language?: string | null
          last_active?: string | null
          os?: string | null
          page_path?: string
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string
          timezone?: string | null
          user_agent?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          visited_at?: string | null
        }
        Relationships: []
      }
      people_tags: {
        Row: {
          created_at: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_advance: boolean
          avatar_url: string | null
          captions_default: boolean
          created_at: string | null
          email: string | null
          email_reminders: boolean
          full_name: string | null
          hide_from_leaderboard: boolean
          id: string
          job_title: string | null
          organisation: string | null
          tour_completed_at: string | null
          tour_last_step: number | null
          tour_status: string | null
          welcomed_at: string | null
        }
        Insert: {
          auto_advance?: boolean
          avatar_url?: string | null
          captions_default?: boolean
          created_at?: string | null
          email?: string | null
          email_reminders?: boolean
          full_name?: string | null
          hide_from_leaderboard?: boolean
          id: string
          job_title?: string | null
          organisation?: string | null
          tour_completed_at?: string | null
          tour_last_step?: number | null
          tour_status?: string | null
          welcomed_at?: string | null
        }
        Update: {
          auto_advance?: boolean
          avatar_url?: string | null
          captions_default?: boolean
          created_at?: string | null
          email?: string | null
          email_reminders?: boolean
          full_name?: string | null
          hide_from_leaderboard?: boolean
          id?: string
          job_title?: string | null
          organisation?: string | null
          tour_completed_at?: string | null
          tour_last_step?: number | null
          tour_status?: string | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          approver_name: string | null
          approver_note: string | null
          contact_email: string | null
          contact_name: string | null
          contact_role: string | null
          created_at: string
          currency: string
          discount_pct: number
          id: string
          intro_note: string | null
          items: Json
          organisation: string
          responded_at: string | null
          status: string
          token: string
          updated_at: string
          valid_until: string | null
          view_count: number
        }
        Insert: {
          approver_name?: string | null
          approver_note?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          currency?: string
          discount_pct?: number
          id?: string
          intro_note?: string | null
          items?: Json
          organisation: string
          responded_at?: string | null
          status?: string
          token?: string
          updated_at?: string
          valid_until?: string | null
          view_count?: number
        }
        Update: {
          approver_name?: string | null
          approver_note?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          currency?: string
          discount_pct?: number
          id?: string
          intro_note?: string | null
          items?: Json
          organisation?: string
          responded_at?: string | null
          status?: string
          token?: string
          updated_at?: string
          valid_until?: string | null
          view_count?: number
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempted_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score?: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          explanation: string | null
          id: string
          options: Json
          position: number
          prompt: string
          quiz_id: string
        }
        Insert: {
          correct_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          position?: number
          prompt: string
          quiz_id: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          position?: number
          prompt?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          module_id: string
          pass_threshold: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          pass_threshold?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          pass_threshold?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecard_results: {
        Row: {
          category_scores: Json
          company_name: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          org_maturity_scores: Json | null
          overall_score: number
          rank_label: string
          rank_number: number
        }
        Insert: {
          category_scores?: Json
          company_name?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          org_maturity_scores?: Json | null
          overall_score: number
          rank_label: string
          rank_number: number
        }
        Update: {
          category_scores?: Json
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          org_maturity_scores?: Json | null
          overall_score?: number
          rank_label?: string
          rank_number?: number
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          page_path: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          page_path: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string
          session_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_first_lessons: {
        Args: never
        Returns: {
          first_lesson_at: string
          lessons_done: number
          user_id: string
        }[]
      }
      admin_get_quiz_questions: {
        Args: { _quiz_id: string }
        Returns: {
          correct_index: number
          created_at: string
          explanation: string | null
          id: string
          options: Json
          position: number
          prompt: string
          quiz_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "quiz_questions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      can_use_lesson_comments: {
        Args: { _lesson: string; _user: string }
        Returns: boolean
      }
      complete_lesson: { Args: { _lesson_id: string }; Returns: Json }
      course_of_lesson: { Args: { _lesson_id: string }; Returns: string }
      course_of_module: { Args: { _module_id: string }; Returns: string }
      course_of_quiz: { Args: { _quiz_id: string }; Returns: string }
      event_rsvp_counts: {
        Args: { _ids: string[] }
        Returns: {
          event_id: string
          going: number
        }[]
      }
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          display_name: string
          is_me: boolean
          lessons: number
          level_name: string
          points: number
          user_id: string
        }[]
      }
      get_member_badges: {
        Args: { _ids: string[] }
        Returns: {
          avatar_url: string
          level: number
          level_name: string
          network_member: boolean
          user_id: string
        }[]
      }
      get_my_gamification: { Args: never; Returns: Json }
      has_community_access: {
        Args: { _space: string; _user: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_enrolled: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      lesson_lock_reason: {
        Args: { _lesson: string; _user: string }
        Returns: string
      }
      level_for: {
        Args: { _points: number }
        Returns: {
          floor_points: number
          level: number
          name: string
          next_points: number
        }[]
      }
      notify: {
        Args: {
          _body: string
          _kind: string
          _link: string
          _title: string
          _user: string
        }
        Returns: undefined
      }
      purge_expired_personal_data: { Args: never; Returns: Json }
      record_lesson_watch: {
        Args: { _duration: number; _lesson_id: string; _watched: number }
        Returns: number
      }
      user_points: {
        Args: { _user: string }
        Returns: {
          courses_completed: number
          finals_passed: number
          lessons: number
          perfect_quizzes: number
          points: number
          posts_counted: number
          quizzes: number
          reactions_received: number
          replies_counted: number
        }[]
      }
      verify_certificate: {
        Args: { _certificate_number: string }
        Returns: {
          certificate_number: string
          completion_date: string
          course_name: string
          cpd_hours: number
          credential_level: string
          external_url: string
          issued_at: string
          recipient_name: string
          revoked_at: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
