-- ─────────────────────────────────────────────────────────────────────────────
-- Wedding RSVP — Private Invitation Links Migration
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the guests table
-- NOTE: Do NOT drop the old rsvps table — it is preserved as-is.
CREATE TABLE IF NOT EXISTS public.guests (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      text        NOT NULL,
  allowed_count  int         NOT NULL DEFAULT 1,
  allow_plus_one boolean     NOT NULL DEFAULT false,
  plus_one_name  text,
  token          text        UNIQUE NOT NULL,
  attending      boolean,
  has_rsvped     boolean     NOT NULL DEFAULT false,
  rsvped_at      timestamptz,
  created_at     timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- 3. Allow everyone to read guests
--    (admin dashboard reads via anon key; invite pages look up by token)
CREATE POLICY "guests_select_all"
  ON public.guests
  FOR SELECT
  USING (true);

-- 4. Allow updates only on rows that have NOT yet submitted an RSVP
--    (prevents double-submission at the database level)
CREATE POLICY "guests_update_unrsvped"
  ON public.guests
  FOR UPDATE
  USING (NOT has_rsvped);

-- ─────────────────────────────────────────────────────────────────────────────
-- After running this SQL, run the import script to populate the table:
--   node scripts/import-guests.mjs
-- ─────────────────────────────────────────────────────────────────────────────
