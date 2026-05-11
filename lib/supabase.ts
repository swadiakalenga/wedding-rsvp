import { createClient } from "@supabase/supabase-js";

export type RsvpRow = {
  id: string;
  full_name: string;
  phone: string;
  attending: boolean;
  guest_count: number;
  companion_names: string | null;
  message: string | null;
  table_number: string | null;
  created_at: string;
};

export type RsvpInsert = {
  full_name: string;
  phone: string;
  attending: boolean;
  guest_count: number;
  companion_names?: string | null;
  message?: string | null;
  table_number?: string | null;
};

type Database = {
  public: {
    Tables: {
      rsvps: {
        Row: RsvpRow;
        Insert: RsvpInsert;
        Update: Partial<RsvpInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
