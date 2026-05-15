/**
 * /api/invite/[token]
 *
 * GET  — look up a guest by their unique token.
 * PATCH — submit RSVP for a guest (once only).
 *
 * Uses the anon key; Supabase RLS handles:
 *   - SELECT: all rows readable (needed for token lookup)
 *   - UPDATE: only rows where has_rsvped = false (prevents double submission)
 */

import { supabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

// ─── GET /api/invite/[token] ───────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data, error } = await supabase
    .from("guests")
    .select(
      "id, full_name, allowed_count, allow_plus_one, has_rsvped, attending, plus_one_name"
    )
    .eq("token", token)
    .single();

  if (error || !data) {
    return Response.json({ error: "Invitation introuvable." }, { status: 404 });
  }

  return Response.json(data);
}

// ─── PATCH /api/invite/[token] ─────────────────────────────────────────────

type PatchBody = {
  attending: boolean;
  plus_one_name?: string | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // 1. Parse body
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (typeof body.attending !== "boolean") {
    return Response.json(
      { error: "Le champ attending est requis (true ou false)." },
      { status: 400 }
    );
  }

  // 2. Look up the guest
  const { data: guest, error: fetchError } = await supabase
    .from("guests")
    .select("id, has_rsvped, allow_plus_one")
    .eq("token", token)
    .single();

  if (fetchError || !guest) {
    return Response.json({ error: "Invitation introuvable." }, { status: 404 });
  }

  // 3. Guard against double submission (application-layer check)
  if (guest.has_rsvped) {
    return Response.json(
      { error: "Votre réponse a déjà été enregistrée." },
      { status: 409 }
    );
  }

  // 4. Validate plus_one_name
  const plusOneName =
    body.attending && guest.allow_plus_one
      ? (body.plus_one_name?.trim() ?? null)
      : null;

  if (body.attending && guest.allow_plus_one && !plusOneName) {
    return Response.json(
      { error: "Le nom du conjoint / de la conjointe est requis." },
      { status: 400 }
    );
  }

  // 5. Update (RLS USING clause also checks has_rsvped = false as a safety net)
  const { error: updateError } = await supabase
    .from("guests")
    .update({
      attending: body.attending,
      has_rsvped: true,
      plus_one_name: plusOneName,
      rsvped_at: new Date().toISOString(),
    })
    .eq("token", token)
    .eq("has_rsvped", false); // extra safety: DB-level guard

  if (updateError) {
    console.error("RSVP update error:", updateError);
    return Response.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
