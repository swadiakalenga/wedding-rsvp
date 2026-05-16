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
import type { GuestRow } from "@/lib/supabase";

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

// ─── Auth store ────────────────────────────────────────────────────────────

const AUTH_KEY = "admin_auth";

function subscribeAuth(cb: () => void) {
  window.addEventListener("admin-auth-change", cb);
  return () => window.removeEventListener("admin-auth-change", cb);
}
const getAuthSnapshot = () => localStorage.getItem(AUTH_KEY) === "1";
const getAuthServerSnapshot = () => false;

function setAuth(value: boolean) {
  if (value) localStorage.setItem(AUTH_KEY, "1");
  else localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("admin-auth-change"));
}

// ─── Shared styles ─────────────────────────────────────────────────────────

const fieldCls =
  "bg-white/70 border border-[#c9a84c]/40 px-3 py-2 text-[#1a1610] " +
  "placeholder:text-[#9a8a6a]/50 focus:outline-none focus:border-[#c9a84c] " +
  "focus:bg-white transition-colors text-sm w-full";

// ─── Admin API helper ──────────────────────────────────────────────────────

async function adminFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": ADMIN_PW,
      ...(options.headers as Record<string, string>),
    },
  });
}

// ─── Ornament ──────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#c9a84c]/30" />
      <span className="text-[#c9a84c]/60 text-[10px] select-none">✦</span>
      <div className="h-px flex-1 bg-[#c9a84c]/30" />
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────

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

// ─── Login gate ────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<"wrong" | "unconfigured" | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ADMIN_PW) { setError("unconfigured"); return; }
    if (pw === ADMIN_PW) { onLogin(); }
    else { setError("wrong"); setPw(""); }
  }

  return (
    <div className="min-h-screen bg-[#faf7f0] flex flex-col items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm flex flex-col gap-7 animate-fade-up"
      >
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
            onChange={(e) => { setPw(e.target.value); setError(null); }}
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

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FilterKey =
  | "all"
  | "rsvped"
  | "not_rsvped"
  | "attending"
  | "not_attending"
  | "plus_one";

// ─── CSV builder ───────────────────────────────────────────────────────────

function buildCSV(rows: GuestRow[], baseUrl: string): string {
  const headers = [
    "Nom complet",
    "Places autorisées",
    "Conjoint autorisé",
    "Nom du conjoint",
    "Présent(e)",
    "RSVP reçu",
    "Date de réponse",
    "Lien d'invitation",
  ];
  const data = rows.map((r) => [
    r.full_name,
    String(r.allowed_count),
    r.allow_plus_one ? "Oui" : "Non",
    r.plus_one_name ?? "",
    r.attending === true ? "Oui" : r.attending === false ? "Non" : "—",
    r.has_rsvped ? "Oui" : "Non",
    fmtDate(r.rsvped_at),
    `${baseUrl}/invite/${r.token}`,
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

// ─── Copy button ───────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copier le lien"
      style={{ fontFamily: "var(--font-cormorant)" }}
      className={`text-xs px-2 py-1 border transition-all duration-200 whitespace-nowrap ${
        copied
          ? "border-emerald-300 text-emerald-700 bg-emerald-50"
          : "border-[#c9a84c]/40 text-[#4a3c26] hover:border-[#c9a84c] hover:bg-[#c9a84c]/10"
      }`}
    >
      {copied ? "✓ Copié" : "Copier"}
    </button>
  );
}

// ─── Modal shell ───────────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-[#faf7f0] border border-[#c9a84c]/30 w-full max-w-md flex flex-col gap-5 p-6 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <h2
            style={{ fontFamily: "var(--font-playfair)" }}
            className="text-[#1a1610] text-xl font-light italic"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9a8a6a] hover:text-[#1a1610] transition-colors text-2xl leading-none shrink-0 mt-0.5"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <Divider />
        {children}
      </div>
    </div>
  );
}

// ─── Form helpers ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{ fontFamily: "var(--font-cormorant)" }}
      className="text-[#9a8a6a] text-xs tracking-[0.2em] uppercase block mb-1"
    >
      {children}
    </label>
  );
}

function FormError({ msg }: { msg: string }) {
  return (
    <p
      style={{ fontFamily: "var(--font-cormorant)" }}
      className="text-red-700 text-sm italic"
    >
      {msg}
    </p>
  );
}

function SubmitBtn({
  loading,
  label,
  loadingLabel,
  disabled,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{ fontFamily: "var(--font-cormorant)" }}
      className="flex-1 py-3 bg-[#1a1610] text-[#e8d5a3] text-sm tracking-[0.3em] uppercase transition-all hover:bg-[#c9a84c] hover:text-[#1a1610] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

function CancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ fontFamily: "var(--font-cormorant)" }}
      className="flex-1 py-3 border border-[#c9a84c]/40 text-[#6b5a3a] text-sm tracking-[0.2em] uppercase hover:bg-[#c9a84c]/10 transition-all"
    >
      Annuler
    </button>
  );
}

// ─── Link display (shared success state) ───────────────────────────────────

function InviteLinkBox({ link }: { link: string }) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>Lien d&apos;invitation</FieldLabel>
      <div className="flex items-center gap-2 bg-white/70 border border-[#c9a84c]/30 px-3 py-2">
        <span className="text-[#4a3c26] text-xs font-mono truncate flex-1">
          {link}
        </span>
        <CopyBtn text={link} />
      </div>
    </div>
  );
}

// ─── Add guest modal ───────────────────────────────────────────────────────

function AddModal({
  onClose,
  onCreated,
  baseUrl,
}: {
  onClose: () => void;
  onCreated: (guest: GuestRow) => void;
  baseUrl: string;
}) {
  const [name, setName] = useState("");
  const [count, setCount] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<GuestRow | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/guests", {
        method: "POST",
        body: JSON.stringify({ full_name: name, allowed_count: count }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Une erreur est survenue."); return; }
      setCreated(json);
      onCreated(json);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const link = `${baseUrl}/invite/${created.token}`;
    return (
      <ModalShell title="Invité ajouté ✓" onClose={onClose}>
        <div className="flex flex-col gap-4">
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#6b5a3a] text-sm italic"
          >
            <strong>{created.full_name}</strong> a bien été ajouté(e) à la liste des invités.
          </p>
          <InviteLinkBox link={link} />
          <button
            onClick={onClose}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="w-full py-3 bg-[#1a1610] text-[#e8d5a3] text-sm tracking-[0.3em] uppercase transition-all hover:bg-[#c9a84c] hover:text-[#1a1610]"
          >
            Fermer
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Ajouter un invité" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>Nom complet *</FieldLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldCls}
            placeholder="Ex : Dupont Marie"
            required
            autoFocus
          />
        </div>

        <div>
          <FieldLabel>Places autorisées</FieldLabel>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value) as 1 | 2)}
            className={fieldCls}
          >
            <option value={1}>1 — Invité seul</option>
            <option value={2}>2 — Couple / +1 autorisé</option>
          </select>
        </div>

        {error && <FormError msg={error} />}

        <div className="flex gap-3 pt-1">
          <CancelBtn onClick={onClose} />
          <SubmitBtn
            loading={loading}
            label="Ajouter"
            loadingLabel="Création…"
            disabled={!name.trim()}
          />
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Edit guest modal ──────────────────────────────────────────────────────

function EditModal({
  guest,
  onClose,
  onSaved,
}: {
  guest: GuestRow;
  onClose: () => void;
  onSaved: (updated: GuestRow) => void;
}) {
  const [name, setName] = useState(guest.full_name);
  const [count, setCount] = useState<1 | 2>(guest.allowed_count as 1 | 2);
  const [plusOneName, setPlusOneName] = useState(guest.plus_one_name ?? "");
  const [attending, setAttending] = useState<"" | "true" | "false">(
    guest.attending === null ? "" : guest.attending ? "true" : "false"
  );
  const [hasRsvped, setHasRsvped] = useState(guest.has_rsvped);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        full_name: name,
        allowed_count: count,
        plus_one_name: plusOneName.trim() || null,
        attending: attending === "" ? null : attending === "true",
        has_rsvped: hasRsvped,
      };
      const res = await adminFetch(`/api/admin/guests/${guest.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Une erreur est survenue."); return; }
      onSaved(json);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Modifier l'invité" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>Nom complet *</FieldLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldCls}
            required
            autoFocus
          />
        </div>

        <div>
          <FieldLabel>Places autorisées</FieldLabel>
          <select
            value={count}
            onChange={(e) => { setCount(Number(e.target.value) as 1 | 2); }}
            className={fieldCls}
          >
            <option value={1}>1 — Invité seul</option>
            <option value={2}>2 — Couple / +1 autorisé</option>
          </select>
        </div>

        {count === 2 && (
          <div>
            <FieldLabel>Nom du / de la conjoint(e)</FieldLabel>
            <input
              type="text"
              value={plusOneName}
              onChange={(e) => setPlusOneName(e.target.value)}
              className={fieldCls}
              placeholder="Nom du conjoint (optionnel)"
            />
          </div>
        )}

        <div>
          <FieldLabel>Présence</FieldLabel>
          <select
            value={attending}
            onChange={(e) => setAttending(e.target.value as "" | "true" | "false")}
            className={fieldCls}
          >
            <option value="">— Non répondu</option>
            <option value="true">Présent(e)</option>
            <option value="false">Absent(e)</option>
          </select>
        </div>

        <div>
          <FieldLabel>Statut RSVP</FieldLabel>
          <select
            value={hasRsvped ? "true" : "false"}
            onChange={(e) => setHasRsvped(e.target.value === "true")}
            className={fieldCls}
          >
            <option value="false">En attente</option>
            <option value="true">RSVP reçu</option>
          </select>
        </div>

        {error && <FormError msg={error} />}

        <div className="flex gap-3 pt-1">
          <CancelBtn onClick={onClose} />
          <SubmitBtn
            loading={loading}
            label="Enregistrer"
            loadingLabel="Enregistrement…"
            disabled={!name.trim()}
          />
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Delete guest modal ────────────────────────────────────────────────────

function DeleteModal({
  guest,
  onClose,
  onDeleted,
}: {
  guest: GuestRow;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/guests/${guest.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Une erreur est survenue.");
        return;
      }
      onDeleted(guest.id);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Supprimer l'invité" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p
          style={{ fontFamily: "var(--font-cormorant)" }}
          className="text-[#1a1610] text-base leading-relaxed"
        >
          Êtes-vous sûr de vouloir supprimer{" "}
          <strong>{guest.full_name}</strong> ? Cette action est irréversible.
        </p>

        {error && <FormError msg={error} />}

        <div className="flex gap-3">
          <CancelBtn onClick={onClose} />
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="flex-1 py-3 bg-red-700 text-white text-sm tracking-[0.3em] uppercase transition-all hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Regenerate link modal ─────────────────────────────────────────────────

function RegenModal({
  guest,
  onClose,
  onRegenerated,
  baseUrl,
}: {
  guest: GuestRow;
  onClose: () => void;
  onRegenerated: (updated: GuestRow) => void;
  baseUrl: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newGuest, setNewGuest] = useState<GuestRow | null>(null);

  async function handleRegen() {
    setError("");
    setLoading(true);
    try {
      const res = await adminFetch(
        `/api/admin/guests/${guest.id}/regenerate`,
        { method: "POST" }
      );
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Une erreur est survenue."); return; }
      setNewGuest(json);
      onRegenerated(json);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (newGuest) {
    const link = `${baseUrl}/invite/${newGuest.token}`;
    return (
      <ModalShell title="Lien régénéré ✓" onClose={onClose}>
        <div className="flex flex-col gap-4">
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#6b5a3a] text-sm italic"
          >
            L&apos;ancien lien de <strong>{newGuest.full_name}</strong> ne fonctionne plus.
            Voici le nouveau lien à partager :
          </p>
          <InviteLinkBox link={link} />
          <button
            onClick={onClose}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="w-full py-3 bg-[#1a1610] text-[#e8d5a3] text-sm tracking-[0.3em] uppercase transition-all hover:bg-[#c9a84c] hover:text-[#1a1610]"
          >
            Fermer
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Régénérer le lien" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p
          style={{ fontFamily: "var(--font-cormorant)" }}
          className="text-[#1a1610] text-base leading-relaxed"
        >
          Un nouveau lien sera généré pour <strong>{guest.full_name}</strong>.{" "}
          <span className="text-red-700 font-semibold">
            L&apos;ancien lien cessera immédiatement de fonctionner.
          </span>
        </p>

        {error && <FormError msg={error} />}

        <div className="flex gap-3">
          <CancelBtn onClick={onClose} />
          <button
            onClick={handleRegen}
            disabled={loading}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="flex-1 py-3 bg-[#1a1610] text-[#e8d5a3] text-sm tracking-[0.3em] uppercase transition-all hover:bg-[#c9a84c] hover:text-[#1a1610] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Génération…" : "Régénérer"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Modal state ───────────────────────────────────────────────────────────

type ModalState =
  | { kind: "none" }
  | { kind: "add" }
  | { kind: "edit"; guest: GuestRow }
  | { kind: "delete"; guest: GuestRow }
  | { kind: "regen"; guest: GuestRow };

// ─── Dashboard ─────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const fetchGuests = useCallback(
    () =>
      supabase
        .from("guests")
        .select("*")
        .order("full_name", { ascending: true }),
    []
  );

  useEffect(() => {
    let active = true;
    fetchGuests().then(({ data, error }) => {
      if (!active) return;
      setLoading(false);
      if (error) { setFetchError(error.message); return; }
      setFetchError("");
      setGuests(data ?? []);
    });
    return () => { active = false; };
  }, [fetchGuests, refreshKey]);

  function refresh() {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  function closeModal() { setModal({ kind: "none" }); }

  // Optimistic guest list updates
  function handleCreated(guest: GuestRow) {
    setGuests((prev) =>
      [...prev, guest].sort((a, b) => a.full_name.localeCompare(b.full_name))
    );
  }

  function handleSaved(updated: GuestRow) {
    setGuests((prev) =>
      prev
        .map((g) => (g.id === updated.id ? updated : g))
        .sort((a, b) => a.full_name.localeCompare(b.full_name))
    );
    closeModal();
  }

  function handleDeleted(id: string) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    closeModal();
  }

  function handleRegenerated(updated: GuestRow) {
    setGuests((prev) =>
      prev.map((g) => (g.id === updated.id ? updated : g))
    );
  }

  // ── Derived ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return guests.filter((g) => {
      const matchSearch = !q || g.full_name.toLowerCase().includes(q);
      const matchFilter =
        filter === "all" ? true
        : filter === "rsvped" ? g.has_rsvped
        : filter === "not_rsvped" ? !g.has_rsvped
        : filter === "attending" ? g.attending === true
        : filter === "not_attending" ? g.attending === false
        : filter === "plus_one" ? g.allow_plus_one
        : true;
      return matchSearch && matchFilter;
    });
  }, [guests, search, filter]);

  const stats = useMemo(() => {
    const confirmed = guests.filter((g) => g.attending === true);
    return {
      total: guests.length,
      rsvped: guests.filter((g) => g.has_rsvped).length,
      confirmed: confirmed.length,
      declined: guests.filter((g) => g.attending === false).length,
      notResponded: guests.filter((g) => !g.has_rsvped).length,
      expectedPeople: confirmed.reduce((s, g) => s + g.allowed_count, 0),
    };
  }, [guests]);

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10);
    triggerDownload(
      buildCSV(filtered, baseUrl),
      `invites-joel-patience-${date}.csv`
    );
  }

  const FILTERS: { k: FilterKey; label: string }[] = [
    { k: "all", label: "Tous" },
    { k: "rsvped", label: "RSVP reçu" },
    { k: "not_rsvped", label: "Sans réponse" },
    { k: "attending", label: "Présents" },
    { k: "not_attending", label: "Absents" },
    { k: "plus_one", label: "Couples" },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f0]">

      {/* ── Modals ── */}
      {modal.kind === "add" && (
        <AddModal
          onClose={closeModal}
          onCreated={handleCreated}
          baseUrl={baseUrl}
        />
      )}
      {modal.kind === "edit" && (
        <EditModal
          guest={modal.guest}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {modal.kind === "delete" && (
        <DeleteModal
          guest={modal.guest}
          onClose={closeModal}
          onDeleted={handleDeleted}
        />
      )}
      {modal.kind === "regen" && (
        <RegenModal
          guest={modal.guest}
          onClose={closeModal}
          onRegenerated={handleRegenerated}
          baseUrl={baseUrl}
        />
      )}

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-fade-up">
          <StatCard label="Invitations" value={stats.total} />
          <StatCard label="RSVP reçus" value={stats.rsvped} />
          <StatCard label="Confirmés" value={stats.confirmed} />
          <StatCard label="Déclinés" value={stats.declined} />
          <StatCard label="Sans réponse" value={stats.notResponded} />
          <StatCard
            label="Personnes attendues"
            value={stats.expectedPeople}
            sub="personnes"
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap gap-3 items-center animate-fade-up">
          <input
            type="text"
            placeholder="Rechercher un invité…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className={`${fieldCls} max-w-[240px]`}
          />

          <div className="flex flex-wrap gap-1">
            {FILTERS.map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{ fontFamily: "var(--font-cormorant)" }}
                className={`px-3 py-1.5 text-xs tracking-[0.12em] uppercase border transition-all duration-200 ${
                  filter === k
                    ? "bg-[#1a1610] text-[#e8d5a3] border-[#1a1610]"
                    : "bg-white/60 text-[#6b5a3a] border-[#c9a84c]/30 hover:border-[#c9a84c]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setModal({ kind: "add" })}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="px-5 py-1.5 bg-[#1a1610] text-[#e8d5a3] text-xs tracking-[0.2em] uppercase hover:bg-[#c9a84c] hover:text-[#1a1610] transition-all duration-200"
          >
            + Ajouter un invité
          </button>

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
              Chargement des invités…
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
              Erreur : {fetchError}
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
        {!loading && !fetchError && guests.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24">
            <span className="text-[#c9a84c]/30 text-5xl select-none">✦</span>
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-xl italic"
            >
              Aucun invité enregistré.
            </p>
            <button
              onClick={() => setModal({ kind: "add" })}
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="px-6 py-2 bg-[#1a1610] text-[#e8d5a3] text-xs tracking-[0.3em] uppercase hover:bg-[#c9a84c] hover:text-[#1a1610] transition-all"
            >
              + Ajouter le premier invité
            </button>
          </div>
        )}

        {/* ── No filter results ── */}
        {!loading && !fetchError && guests.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16">
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-lg italic"
            >
              Aucun résultat pour cette recherche.
            </p>
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
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
              {filtered.length} invité{filtered.length > 1 ? "s" : ""}
              {filtered.length !== guests.length
                ? ` sur ${guests.length} au total`
                : ""}
            </p>

            <div className="overflow-x-auto border border-[#c9a84c]/20">
              <table className="w-full text-sm border-collapse min-w-[1350px]">
                <thead>
                  <tr className="bg-[#1a1610]">
                    {[
                      "Nom complet",
                      "Places",
                      "+1",
                      "Conjoint(e)",
                      "Présence",
                      "RSVP",
                      "Date de réponse",
                      "Lien d'invitation",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{ fontFamily: "var(--font-cormorant)" }}
                        className="text-left text-[10px] tracking-[0.25em] uppercase text-[#9a8a6a] py-3 px-3 font-normal whitespace-nowrap border-b border-[#c9a84c]/20"
                      >
                        {h}
                      </th>
                    ))}
                    <th
                      style={{ fontFamily: "var(--font-cormorant)" }}
                      className="text-left text-[10px] tracking-[0.25em] uppercase text-[#9a8a6a] py-3 px-4 font-normal whitespace-nowrap border-b border-[#c9a84c]/20 sticky right-0 bg-[#1a1610] z-10 border-l border-l-[#c9a84c]/20"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, i) => {
                    const inviteUrl = `${baseUrl}/invite/${g.token}`;
                    return (
                      <tr
                        key={g.id}
                        className={`border-b border-[#c9a84c]/10 transition-colors hover:bg-[#c9a84c]/5 ${
                          i % 2 === 0 ? "bg-white/50" : "bg-[#faf7f0]"
                        }`}
                      >
                        {/* Nom */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 text-[#1a1610] font-semibold whitespace-nowrap max-w-[180px] truncate"
                          title={g.full_name}
                        >
                          {g.full_name}
                        </td>

                        {/* Places */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 text-[#6b5a3a] text-center"
                        >
                          {g.allowed_count}
                        </td>

                        {/* +1 */}
                        <td className="py-3 px-3 text-center">
                          <span
                            style={{ fontFamily: "var(--font-cormorant)" }}
                            className={`text-xs ${
                              g.allow_plus_one
                                ? "text-[#c9a84c] font-semibold"
                                : "text-[#c9a84c]/30"
                            }`}
                          >
                            {g.allow_plus_one ? "Oui" : "—"}
                          </span>
                        </td>

                        {/* Conjoint */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 max-w-[140px]"
                        >
                          {g.plus_one_name ? (
                            <span className="text-[#6b5a3a] text-xs">
                              {g.plus_one_name}
                            </span>
                          ) : (
                            <span className="text-[#c9a84c]/30 text-xs">—</span>
                          )}
                        </td>

                        {/* Présence */}
                        <td className="py-3 px-3">
                          {g.attending === null ? (
                            <span
                              style={{ fontFamily: "var(--font-cormorant)" }}
                              className="text-[#c9a84c]/40 text-xs"
                            >
                              —
                            </span>
                          ) : (
                            <span
                              style={{ fontFamily: "var(--font-cormorant)" }}
                              className={`inline-block px-2 py-0.5 text-xs border whitespace-nowrap ${
                                g.attending
                                  ? "border-[#c9a84c]/40 text-[#5a4200] bg-[#c9a84c]/10"
                                  : "border-red-200 text-red-600 bg-red-50"
                              }`}
                            >
                              {g.attending ? "Oui ✓" : "Non"}
                            </span>
                          )}
                        </td>

                        {/* RSVP reçu */}
                        <td className="py-3 px-3">
                          <span
                            style={{ fontFamily: "var(--font-cormorant)" }}
                            className={`inline-block px-2 py-0.5 text-xs border whitespace-nowrap ${
                              g.has_rsvped
                                ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                : "border-[#c9a84c]/20 text-[#9a8a6a] bg-transparent"
                            }`}
                          >
                            {g.has_rsvped ? "Reçu" : "En attente"}
                          </span>
                        </td>

                        {/* Date */}
                        <td
                          style={{ fontFamily: "var(--font-cormorant)" }}
                          className="py-3 px-3 text-[#9a8a6a] text-xs whitespace-nowrap"
                        >
                          {fmtDate(g.rsvped_at)}
                        </td>

                        {/* Lien */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <span
                              className="text-[#6b5a3a] text-xs font-mono truncate max-w-[140px]"
                              title={inviteUrl}
                            >
                              /invite/{g.token.slice(0, 10)}…
                            </span>
                            <CopyBtn text={inviteUrl} />
                          </div>
                        </td>

                        {/* Actions — sticky so always visible on horizontal scroll */}
                        <td
                          className={`py-3 px-4 whitespace-nowrap sticky right-0 z-10 border-l border-l-[#c9a84c]/15 ${
                            i % 2 === 0 ? "bg-white" : "bg-[#faf7f0]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setModal({ kind: "edit", guest: g })}
                              style={{ fontFamily: "var(--font-cormorant)" }}
                              className="text-xs px-2.5 py-1 border border-[#c9a84c]/40 text-[#4a3c26] hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all tracking-[0.05em] whitespace-nowrap"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => setModal({ kind: "regen", guest: g })}
                              style={{ fontFamily: "var(--font-cormorant)" }}
                              className="text-xs px-2.5 py-1 border border-[#c9a84c]/40 text-[#4a3c26] hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all tracking-[0.05em] whitespace-nowrap"
                            >
                              Régénérer
                            </button>
                            <button
                              onClick={() => setModal({ kind: "delete", guest: g })}
                              style={{ fontFamily: "var(--font-cormorant)" }}
                              className="text-xs px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-all tracking-[0.05em] whitespace-nowrap font-semibold"
                            >
                              Supprimer
                            </button>
                          </div>
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

// ─── Page root ─────────────────────────────────────────────────────────────

export default function AdminPage() {
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
