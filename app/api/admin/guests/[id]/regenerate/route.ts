import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

function checkAuth(req: NextRequest): boolean {
  return ADMIN_PW !== "" && req.headers.get("x-admin-password") === ADMIN_PW;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  const token = crypto.randomBytes(24).toString("hex");

  const { data, error } = await getSupabaseAdmin()
    .from("guests")
    .update({ token })
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
