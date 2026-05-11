"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import { supabase } from "@/lib/supabase";
import type { RsvpRow } from "@/lib/supabase";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

// ─── Auth store via useSyncExternalStore ───────────────────────────────────────
// Avoids calling setState inside useEffect (Next.js 16 lint rule).

const AUTH_KEY = "admin_auth";

function subscribeAuth(cb: () => void) {
  window.addEventListener("admin-auth-change", cb);
  return () => window.removeEventListener("admin-auth-change", cb);
}
const getAuthSnapshot = () => localStorage.getItem(AUTH_KEY) === "1";
const getAuthServerSnapshot = () => false;

function setAuth(value: boolean) {
  if (value) {
    localStorage.setItem(AUTH_KEY, "1");
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
  window.dispatchEvent(new Event("admin-auth-change"));
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const fieldCls =
  "bg-white/70 border border-[#c9a84c]/40 px-3 py-2 text-[#1a1610] " +
  "placeholder:text-[#9a8a6a]/50 focus:outline-none focus:border-[#c9a84c] " +
  "focus:bg-white transition-colors text-sm w-full";

// ─── Ornament ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#c9a84c]/30" />
      <span className="text-[#c9a84c]/60 text-[10px] select-none">✦</span>
      <div className="h-px flex-1 bg-[#c9a84c]/30" />
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="relative flex flex-col gap-1 p-5 bg-white/60 border border-[#c9a84c]/25 overflow-hidden">
      <span className="absolute top-2 right-2 text-[#c9a84c]/20 text-base select-none">
        ✦
      </span>
      <p
        style={{ fontFamily: "var(--font-cormorant)" }}
        className="text-[#9a8a6a] text-[10px] tracking-[0.25em] uppercase"
      >
        {label}
      </p>
      <p
        style={{ fontFamily: "var(--font-playfair)" }}
        className="text-[#1a1610] text-3xl font-light leading-none mt-1"
      >
        {value}
      </p>
      {sub && (
        <p
          style={{ fontFamily: "var(--font-cormorant)" }}
          className="text-[#9a8a6a] text-xs italic mt-0.5"
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Password gate ─────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<"wrong" | "unconfigured" | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ADMIN_PW) {
      setError("unconfigured");
      return;
    }
    if (pw === ADMIN_PW) {
      onLogin();
    } else {
      setError("wrong");
      setPw("");
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f0] flex flex-col items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm flex flex-col gap-7 animate-fade-up"
      >
        {/* Corner accents */}
        <span className="absolute -top-8 -left-8 w-8 h-8 border-l border-t border-[#c9a84c]/40 hidden sm:block" />
        <span className="absolute -top-8 -right-8 w-8 h-8 border-r border-t border-[#c9a84c]/40 hidden sm:block" />
        <span className="absolute -bottom-8 -left-8 w-8 h-8 border-l border-b border-[#c9a84c]/40 hidden sm:block" />
        <span className="absolute -bottom-8 -right-8 w-8 h-8 border-r border-b border-[#c9a84c]/40 hidden sm:block" />

        <div className="flex flex-col items-center gap-5">
          <Divider />
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-xs tracking-[0.4em] uppercase text-center"
          >
            Joël &amp; Patience
          </p>
          <h1
            style={{ fontFamily: "var(--font-playfair)" }}
            className="text-[#1a1610] text-3xl font-light italic text-center"
          >
            Accès réservé
          </h1>
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#6b5a3a] text-sm italic text-center"
          >
            Tableau de bord administrateur
          </p>
          <Divider />
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Mot de passe"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError(null);
            }}
            className={`${fieldCls} py-3 text-center tracking-[0.3em]`}
            autoFocus
            autoComplete="current-password"
          />

          {error && (
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-red-700 text-sm italic text-center"
            >
              {error === "unconfigured"
                ? "Mot de passe non configuré dans .env.local."
                : "Mot de passe incorrect. Veuillez réessayer."}
            </p>
          )}

          <button
            type="submit"
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="w-full py-3 bg-[#1a1610] text-[#e8d5a3] text-sm tracking-[0.3em] uppercase font-medium transition-all duration-300 hover:bg-[#c9a84c] hover:text-[#1a1610] hover:scale-[1.01] active:scale-[0.99]"
          >
            Accéder
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Save button ───────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

function SaveBtn({
  status,
  onClick,
}: {
  status: SaveStatus;
  onClick: () => void;
}) {
  const label =
    status === "saving"
      ? "…"
      : status === "saved"
        ? "✓"
        : status === "error"
          ? "✗"
          : "Sauv.";

  const cls =
    status === "saved"
      ? "border-emerald-300 text-emerald-700 bg-emerald-50"
      : status === "error"
        ? "border-red-300 text-red-600 bg-red-50"
        : status === "saving"
          ? "border-[#c9a84c]/30 text-[#9a8a6a] opacity-60 cursor-not-allowed"
          : "border-[#c9a84c]/40 text-[#4a3c26] hover:border-[#c9a84c] hover:bg-[#c9a84c]/10";

  return (
    <button
      onClick={onClick}
      disabled={status === "saving"}
      style={{ fontFamily: "var(--font-cormorant)" }}
      className={`text-xs px-2 py-1 border transition-all duration-200 whitespace-nowrap ${cls}`}
    >
      {label}
    </button>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Display-only formatting — raw normalized value is never touched.
function formatPhone(raw: string): string {
  const stripped = raw.replace(/[\s\-().]/g, "");

  if (stripped.startsWith("+")) {
    const digits = stripped.slice(1);
    // Congo +243 + 9 digits
    if (digits.startsWith("243") && digits.length === 12) {
      return `+243 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
    // North America +1 + 10 digits
    if (digits.startsWith("1") && digits.length === 11) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    // Generic international: group remaining digits in threes
    const groups: string[] = [];
    let rest = digits;
    while (rest.length > 3) {
      groups.push(rest.slice(0, 3));
      rest = rest.slice(3);
    }
    groups.push(rest);
    return "+" + groups.join(" ");
  }

  // 10-digit starting with 0 (African local format): 081 234 5678
  if (/^0\d{9}$/.test(stripped)) {
    return `${stripped.slice(0, 3)} ${stripped.slice(3, 6)} ${stripped.slice(6)}`;
  }

  // 10-digit, no leading 0 — treat as NANP: (NXX) NXX-XXXX
  if (/^\d{10}$/.test(stripped)) {
    return `(${stripped.slice(0, 3)}) ${stripped.slice(3, 6)}-${stripped.slice(6)}`;
  }

  // Unknown: group all digits in threes with spaces
  const onlyDigits = stripped.replace(/\D/g, "");
  if (!onlyDigits) return raw;
  const groups: string[] = [];
  let d = onlyDigits;
  while (d.length > 3) {
    groups.push(d.slice(0, 3));
    d = d.slice(3);
  }
  groups.push(d);
  return groups.join(" ");
}

function buildCSV(rows: RsvpRow[]): string {
  const headers = [
    "Nom complet",
    "Téléphone",
    "Présence",
    "Nb personnes",
    "Accompagnants",
    "Table",
    "Message",
    "Date de réponse",
  ];
  const data = rows.map((r) => [
    r.full_name,
    // ="..." forces Excel to treat the cell as text, preventing scientific notation.
    `="${formatPhone(r.phone)}"`,
    r.attending ? "Oui" : "Non",
    String(r.guest_count),
    r.companion_names ?? "",
    r.table_number ?? "",
    r.message ?? "",
    fmtDate(r.created_at),
  ]);
  return [headers, ...data]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\r\n");
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob(["﻿" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [filterAttending, setFilterAttending] = useState<"all" | "yes" | "no">(
    "all"
  );
  const [tableInputs, setTableInputs] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});

  // fetchRsvps is a pure async function — no setState inside.
  // The effect handles all state updates from its resolved value.
  const fetchRsvps = useCallback(
    () =>
      supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false }),
    []
  );

  useEffect(() => {
    let active = true;
    fetchRsvps().then(({ data, error }) => {
      if (!active) return;
      setLoading(false);
      if (error) {
        setFetchError(error.message);
        return;
      }
      const rows = data ?? [];
      setFetchError("");
      setRsvps(rows);
      const inputs: Record<string, string> = {};
      rows.forEach((r) => {
        inputs[r.id] = r.table_number ?? "";
      });
      setTableInputs(inputs);
    });
    return () => {
      active = false;
    };
  }, [fetchRsvps, refreshKey]);

  function refresh() {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rsvps.filter((r) => {
      const matchSearch =
        !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        formatPhone(r.phone).toLowerCase().includes(q);
      const matchAttending =
        filterAttending === "all" ||
        (filterAttending === "yes" ? r.attending : !r.attending);
      return matchSearch && matchAttending;
    });
  }, [rsvps, search, filterAttending]);

  const stats = useMemo(
    () => ({
      total: rsvps.length,
      confirmed: rsvps.filter((r) => r.attending).length,
      declined: rsvps.filter((r) => !r.attending).length,
      totalPeople: rsvps
        .filter((r) => r.attending)
        .reduce((s, r) => s + r.guest_count, 0),
      tablesAssigned: new Set(
        rsvps.map((r) => r.table_number).filter(Boolean)
      ).size,
    }),
    [rsvps]
  );

  // ── Table save ───────────────────────────────────────────────────────────────

  async function saveTable(id: string) {
    setSaveStatus((p) => ({ ...p, [id]: "saving" }));
    const value = tableInputs[id]?.trim() || null;
    const { error } = await supabase
      .from("rsvps")
      .update({ table_number: value })
      .eq("id", id);
    if (error) {
      setSaveStatus((p) => ({ ...p, [id]: "error" }));
      setTimeout(() => setSaveStatus((p) => ({ ...p, [id]: "idle" })), 3000);
      return;
    }
    setRsvps((p) =>
      p.map((r) => (r.id === id ? { ...r, table_number: value } : r))
    );
    setSaveStatus((p) => ({ ...p, [id]: "saved" }));
    setTimeout(() => setSaveStatus((p) => ({ ...p, [id]: "idle" })), 2000);
  }

  // ── CSV ──────────────────────────────────────────────────────────────────────

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10);
    triggerDownload(buildCSV(filtered), `rsvp-joel-patience-${date}.csv`);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#faf7f0]">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-[#1a1610] border-b border-[#c9a84c]/20 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[#c9a84c] text-xs select-none shrink-0">✦</span>
          <p
            style={{ fontFamily: "var(--font-playfair)" }}
            className="text-[#e8d5a3] text-base sm:text-lg italic truncate"
          >
            Joël &amp; Patience
          </p>
          <span className="text-[#c9a84c]/30 hidden sm:block">—</span>
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-xs tracking-[0.2em] uppercase hidden sm:block"
          >
            Administration
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={refresh}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-xs tracking-[0.15em] uppercase hover:text-[#c9a84c] transition-colors"
          >
            Actualiser
          </button>
          <span className="text-[#c9a84c]/20">|</span>
          <button
            onClick={onLogout}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-xs tracking-[0.15em] uppercase hover:text-[#c9a84c] transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">
        {/* ── Title ── */}
        <div className="flex flex-col gap-3 animate-fade-up">
          <h1
            style={{ fontFamily: "var(--font-playfair)" }}
            className="text-[#1a1610] text-3xl sm:text-4xl font-light italic"
          >
            Tableau de bord
          </h1>
          <Divider />
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 animate-fade-up">
          <StatCard label="Réponses totales" value={stats.total} />
          <StatCard label="Confirmés" value={stats.confirmed} />
          <StatCard label="Déclinés" value={stats.declined} />
          <StatCard
            label="Invités attendus"
            value={stats.totalPeople}
            sub="personnes"
          />
          <StatCard
            label="Tables utilisées"
            value={stats.tablesAssigned}
            sub="numéros uniques"
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap gap-3 items-center animate-fade-up">
          <input
            type="text"
            placeholder="Nom ou téléphone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className={`${fieldCls} max-w-[220px]`}
          />

          <div className="flex gap-1">
            {(
              [
                { k: "all", label: "Tous" },
                { k: "yes", label: "Présents" },
                { k: "no", label: "Absents" },
              ] as const
            ).map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setFilterAttending(k)}
                style={{ fontFamily: "var(--font-cormorant)" }}
                className={`px-3 py-1.5 text-xs tracking-[0.15em] uppercase border transition-all duration-200 ${
                  filterAttending === k
                    ? "bg-[#1a1610] text-[#e8d5a3] border-[#1a1610]"
                    : "bg-white/60 text-[#6b5a3a] border-[#c9a84c]/30 hover:border-[#c9a84c]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="ml-auto px-5 py-1.5 border border-[#c9a84c]/50 text-[#4a3c26] text-xs tracking-[0.2em] uppercase hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↓ Exporter CSV
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-lg italic animate-pulse"
            >
              Chargement des réponses…
            </p>
          </div>
        )}

        {/* ── Fetch error ── */}
        {!loading && fetchError && (
          <div className="flex items-center gap-4 p-5 border border-red-200 bg-red-50/60">
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-red-700 italic text-sm flex-1"
            >
              Erreur lors du chargement : {fetchError}
            </p>
            <button
              onClick={refresh}
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#c9a84c] text-xs underline underline-offset-2"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !fetchError && rsvps.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24">
            <span className="text-[#c9a84c]/30 text-5xl select-none">✦</span>
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-xl italic"
            >
              Aucune réponse enregistrée pour le moment.
            </p>
          </div>
        )}

        {/* ── No filter results ── */}
        {!loading && !fetchError && rsvps.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16">
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-lg italic"
            >
              Aucun résultat pour cette recherche.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilterAttending("all");
              }}
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase underline underline-offset-2"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !fetchError && filtered.length > 0 && (
          <div className="flex flex-col gap-3 animate-fade-up">
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-xs italic"
            >
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              {filtered.length !== rsvps.length
                ? ` sur ${rsvps.length} au total`
                : ""}
            </p>

            <div className="overflow-x-auto border border-[#c9a84c]/20">
              <table className="w-full text-sm border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-[#1a1610]">
                    {[
                      "Nom complet",
                      "Téléphone",
                      "Présence",
                      "Pers.",
                      "Accompagnants",
                      "Table",
                      "Message",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{ fontFamily: "var(--font-cormorant)" }}
                        className="text-left text-[10px] tracking-[0.25em] uppercase text-[#9a8a6a] py-3 px-3 font-normal whitespace-nowrap border-b border-[#c9a84c]/20"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const st: SaveStatus = saveStatus[r.id] ?? "idle";
                    return (
                      <tr
                        key={r.id}
                        className={`border-b border-[#c9a84c]/10 transition-colors hover:bg-[#c9a84c]/5 ${
                          i % 2 === 0 ? "bg-white/50" : "bg-[#faf7f0]"
                        }`}
                      >
                        {/* Nom */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 text-[#1a1610] font-semibold whitespace-nowrap max-w-[180px] truncate"
                          title={r.full_name}
                        >
                          {r.full_name}
                        </td>

                        {/* Téléphone */}
                        <td
                          className="py-3 px-3 text-[#6b5a3a] font-mono text-xs whitespace-nowrap tracking-wide"
                          title={r.phone}
                        >
                          {formatPhone(r.phone)}
                        </td>

                        {/* Présence */}
                        <td className="py-3 px-3">
                          <span
                            style={{ fontFamily: "var(--font-cormorant)" }}
                            className={`inline-block px-2 py-0.5 text-xs border whitespace-nowrap ${
                              r.attending
                                ? "border-[#c9a84c]/40 text-[#5a4200] bg-[#c9a84c]/10"
                                : "border-red-200 text-red-600 bg-red-50"
                            }`}
                          >
                            {r.attending ? "Oui ✓" : "Non"}
                          </span>
                        </td>

                        {/* Nb personnes */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 text-[#6b5a3a] text-center"
                        >
                          {r.guest_count}
                        </td>

                        {/* Accompagnants */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 max-w-[160px]"
                        >
                          {r.companion_names ? (
                            <span className="text-[#6b5a3a] text-xs whitespace-pre-line leading-snug block">
                              {r.companion_names}
                            </span>
                          ) : (
                            <span className="text-[#c9a84c]/30 text-xs">—</span>
                          )}
                        </td>

                        {/* Table */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="N°"
                              value={tableInputs[r.id] ?? ""}
                              onChange={(e) =>
                                setTableInputs((p) => ({
                                  ...p,
                                  [r.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveTable(r.id);
                              }}
                              className="w-14 bg-white/70 border border-[#c9a84c]/40 px-2 py-1 text-xs focus:outline-none focus:border-[#c9a84c] text-[#1a1610] text-center"
                            />
                            <SaveBtn
                              status={st}
                              onClick={() => saveTable(r.id)}
                            />
                          </div>
                        </td>

                        {/* Message */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 max-w-[180px]"
                        >
                          {r.message ? (
                            <span
                              className="text-[#6b5a3a] text-xs italic line-clamp-2 block"
                              title={r.message}
                            >
                              {r.message}
                            </span>
                          ) : (
                            <span className="text-[#c9a84c]/30 text-xs">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 text-[#9a8a6a] text-xs whitespace-nowrap"
                        >
                          {fmtDate(r.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="pt-4">
          <Divider />
        </div>
      </div>
    </div>
  );
}

// ─── Page root ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  // useSyncExternalStore reads localStorage correctly on client,
  // returns false on server (no hydration mismatch, no useEffect setState).
  const authed = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  return (
    <div className={`${playfair.variable} ${cormorant.variable}`}>
      {authed ? (
        <Dashboard onLogout={() => setAuth(false)} />
      ) : (
        <LoginGate onLogin={() => setAuth(true)} />
      )}
    </div>
  );
}
