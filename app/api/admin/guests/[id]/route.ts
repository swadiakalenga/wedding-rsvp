import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { NextRequest } from "next/server";

const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

function checkAuth(req: NextRequest): boolean {
  return ADMIN_PW !== "" && req.headers.get("x-admin-password") === ADMIN_PW;
}

// ─── PATCH /api/admin/guests/[id] ─────────────────────────────────────────

type PatchBody = {
  full_name?: string;
  allowed_count?: 1 | 2;
  plus_one_name?: string | null;
  attending?: boolean | null;
  has_rsvped?: boolean;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if ("full_name" in body) {
    const name = body.full_name?.trim();
    if (!name) {
      return Response.json({ error: "Le nom complet est requis." }, { status: 400 });
    }
    update.full_name = name;
  }

  if ("allowed_count" in body) {
    if (body.allowed_count !== 1 && body.allowed_count !== 2) {
      return Response.json(
        { error: "allowed_count doit être 1 ou 2." },
        { status: 400 }
      );
    }
    update.allowed_count = body.allowed_count;
    update.allow_plus_one = body.allowed_count === 2;
  }

  if ("plus_one_name" in body) {
    update.plus_one_name = body.plus_one_name?.trim() || null;
  }

  if ("attending" in body) {
    update.attending = body.attending ?? null;
  }

  if ("has_rsvped" in body) {
    update.has_rsvped = body.has_rsvped;
    if (!body.has_rsvped) {
      update.rsvped_at = null;
    }
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "Aucun champ à mettre à jour." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("guests")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: "Invité introuvable." }, { status: 404 });
  }

  return Response.json(data);
}

// ─── DELETE /api/admin/guests/[id] ────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await getSupabaseAdmin()
    .from("guests")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
