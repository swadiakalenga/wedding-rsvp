import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side only — never import in client components or pages
// Bypasses RLS; used exclusively in /api/admin/* routes

let _adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    _adminClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return _adminClient;
}
