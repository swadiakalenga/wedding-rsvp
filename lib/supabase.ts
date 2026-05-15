import { createClient } from "@supabase/supabase-js";

// ─── Old rsvps table (preserved, not deleted) ──────────────────────────────

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

// ─── New guests table (private invitation links) ───────────────────────────

export type GuestRow = {
  id: string;
  full_name: string;
  allowed_count: number;
  allow_plus_one: boolean;
  plus_one_name: string | null;
  token: string;
  attending: boolean | null;
  has_rsvped: boolean;
  rsvped_at: string | null;
  created_at: string;
};

export type GuestUpdate = {
  attending: boolean;
  has_rsvped: boolean;
  plus_one_name?: string | null;
  rsvped_at: string;
};

// ─── Database type map ─────────────────────────────────────────────────────

type Database = {
  public: {
    Tables: {
      rsvps: {
        Row: RsvpRow;
        Insert: RsvpInsert;
        Update: Partial<RsvpInsert>;
        Relationships: [];
      };
      guests: {
        Row: GuestRow;
        Insert: Omit<GuestRow, "id" | "created_at">;
        Update: GuestUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

// ─── Browser / edge client (anon key — safe to use in client components) ──

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
