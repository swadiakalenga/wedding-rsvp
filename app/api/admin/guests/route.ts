import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

function checkAuth(req: NextRequest): boolean {
  return ADMIN_PW !== "" && req.headers.get("x-admin-password") === ADMIN_PW;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  let body: { full_name?: string; allowed_count?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const name = body.full_name?.trim();
  if (!name) {
    return Response.json({ error: "Le nom complet est requis." }, { status: 400 });
  }

  const count = body.allowed_count;
  if (count !== 1 && count !== 2) {
    return Response.json(
      { error: "allowed_count doit être 1 ou 2." },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(24).toString("hex");

  const { data, error } = await getSupabaseAdmin()
    .from("guests")
    .insert({
      full_name: name,
      allowed_count: count,
      allow_plus_one: count === 2,
      token,
      has_rsvped: false,
      attending: null,
      plus_one_name: null,
      rsvped_at: null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
