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
      certificates: {
        Row: {
          certificate_number: string
          completion_date: string
          course_name: string
          cpd_hours: number | null
          created_at: string
          credential_level: string | null
          engaged_at: string | null
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
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          inquiry_type: string | null
          job_title: string | null
          message: string | null
          name: string
          phone: string | null
          role: string | null
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string | null
          job_title?: string | null
          message?: string | null
          name: string
          phone?: string | null
          role?: string | null
          source: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string | null
          job_title?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          source?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          browser_version: string | null
          city: string | null
          country: string | null
          device_type: string | null
          duration: number | null
          id: string
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
          country?: string | null
          device_type?: string | null
          duration?: number | null
          id?: string
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
          country?: string | null
          device_type?: string | null
          duration?: number | null
          id?: string
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
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verify_certificate: {
        Args: { _certificate_number: string }
        Returns: {
          certificate_number: string
          completion_date: string
          course_name: string
          cpd_hours: number
          credential_level: string
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
      app_role: ["admin", "user"],
    },
  },
} as const
