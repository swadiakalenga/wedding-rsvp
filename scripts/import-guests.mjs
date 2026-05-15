/**
 * Import guests from the Excel file into Supabase.
 *
 * Prerequisites:
 *   1. Run supabase/migration.sql in Supabase SQL Editor first.
 *   2. Ensure .env.local exists (copied from the project root).
 *
 * Usage (from the project root):
 *   node scripts/import-guests.mjs
 *
 * The script is idempotent: it will not insert a guest whose full_name
 * already exists. Re-run safely after fixing data.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "../.env.local");
const envLines = readFileSync(envPath, "utf8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

// ── Load xlsx (installed as dev dependency) ──────────────────────────────────
const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

// ── Excel file path ──────────────────────────────────────────────────────────
// Try both the project root and Downloads — adjust if your file is elsewhere.
const EXCEL_CANDIDATES = [
  resolve(__dirname, "../Liste_Invites_Mariage_Separe_CORRIGE (1) (1)(1).xlsx"),
  resolve(__dirname, "../Liste_Invites_Mariage_Separe_CORRIGE (1) (1).xlsx"),
  resolve(
    process.env.HOME ?? "/",
    "Downloads/Liste_Invites_Mariage_Separe_CORRIGE (1) (1).xlsx"
  ),
];

let excelPath = null;
for (const candidate of EXCEL_CANDIDATES) {
  try {
    readFileSync(candidate);
    excelPath = candidate;
    break;
  } catch {
    // try next
  }
}

if (!excelPath) {
  console.error(
    "❌  Excel file not found. Please place it in the project root or ~/Downloads.\n" +
    "    Expected name: Liste_Invites_Mariage_Separe_CORRIGE (1) (1).xlsx"
  );
  process.exit(1);
}

console.log(`📂  Reading: ${excelPath}`);

// ── Parse Excel ──────────────────────────────────────────────────────────────
const SHEET_NAME = "Liste principale";

/** Words/patterns that mark a row as a section header or total — skip these. */
const SKIP_NAME_RE =
  /^(nom\s+des\s+invit|noms?\s+des\s+invit|demoissell|total\s*$)/i;

function parseGuests(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[SHEET_NAME];
  if (!ws) {
    throw new Error(`Sheet "${SHEET_NAME}" not found. Available: ${wb.SheetNames.join(", ")}`);
  }

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const guests = [];

  for (const row of rows) {
    const rawName = String(row[0] ?? "").trim();
    const rawCount = row[1];

    // Skip blank rows
    if (!rawName) continue;

    // Skip section headers (B column is not a positive integer)
    const count = typeof rawCount === "number" && Number.isInteger(rawCount) && rawCount > 0
      ? rawCount
      : null;
    if (count === null) continue;

    // Skip total rows (name starts with "total" / "TOTAL" / " Total" etc.)
    if (SKIP_NAME_RE.test(rawName)) continue;

    guests.push({
      full_name: rawName,
      allowed_count: count,
      allow_plus_one: count === 2,
      token: randomBytes(24).toString("hex"), // 48-char hex token
      has_rsvped: false,
      attending: null,
      plus_one_name: null,
      rsvped_at: null,
    });
  }

  return guests;
}

// ── Supabase upsert via REST ─────────────────────────────────────────────────
async function upsertGuests(guests) {
  const url = `${SUPABASE_URL}/rest/v1/guests`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      // onConflict=full_name: skip rows whose full_name already exists
      "Prefer": "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify(guests),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase error ${res.status}: ${body}`);
  }

  const inserted = await res.json();
  return inserted;
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  let guests;
  try {
    guests = parseGuests(excelPath);
  } catch (err) {
    console.error("❌  Failed to parse Excel:", err.message);
    process.exit(1);
  }

  console.log(`\n👥  Found ${guests.length} guests to import:\n`);
  guests.forEach((g, i) =>
    console.log(
      `  ${String(i + 1).padStart(3, " ")}. ${g.full_name.padEnd(35)} count=${g.allowed_count}  +1=${g.allow_plus_one}  token=${g.token.slice(0, 12)}…`
    )
  );

  console.log("\n🚀  Inserting into Supabase (duplicates by full_name will be skipped)…\n");

  let inserted;
  try {
    inserted = await upsertGuests(guests);
  } catch (err) {
    console.error("❌  Import failed:", err.message);
    process.exit(1);
  }

  console.log(`✅  Done! ${inserted.length} new guests inserted (${guests.length - inserted.length} already existed).\n`);

  // Print a sample invite link for each newly inserted guest
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  console.log("🔗  Sample invitation links:\n");
  inserted.slice(0, 5).forEach((g) => {
    console.log(`  ${g.full_name}`);
    console.log(`  ${baseUrl}/invite/${g.token}\n`);
  });

  if (inserted.length > 5) {
    console.log(`  … and ${inserted.length - 5} more.\n`);
  }
})();
