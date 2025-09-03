export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          options: Json;
          created_at: string;
          created_by: string;
          ends_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          options: Json;
          created_at?: string;
          created_by: string;
          ends_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          options?: Json;
          created_at?: string;
          created_by?: string;
          ends_at?: string | null;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string;
          option_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          user_id: string;
          option_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          user_id?: string;
          option_index?: number;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
