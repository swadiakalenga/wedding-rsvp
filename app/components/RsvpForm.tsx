"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type FormState = {
  full_name: string;
  phone: string;
  attending: boolean;
  guest_count: number;
  companion_names: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

const INITIAL: FormState = {
  full_name: "",
  phone: "",
  attending: true,
  guest_count: 1,
  companion_names: "",
  message: "",
};

// ─── Phone normalisation ───────────────────────────────────────────────────────
// Strips spaces, dashes, dots, and parentheses — preserves leading + and digits.
// +243 81-234 56.78 → +243812345678
function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-.()]/g, "").trim();
}

// ─── Shared input styles ───────────────────────────────────────────────────────

const inputClass =
  "w-full bg-white/70 border border-[#c9a84c]/40 px-4 py-3 text-[#1a1610] placeholder:text-[#9a8a6a]/60 focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-colors duration-200 text-base";

const labelClass =
  "block text-[#4a3c26] text-xs tracking-[0.25em] uppercase mb-2 font-medium";

export default function RsvpForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const phone = normalizePhone(form.phone);

    // ── Layer 1: pre-check for duplicate phone ───────────────────────────────
    // Uses head:true so no row data is transferred — just the count.
    const { count, error: checkError } = await supabase
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("phone", phone);

    if (!checkError && count !== null && count > 0) {
      setStatus("duplicate");
      return;
    }

    // ── Companion name validation ─────────────────────────────────────────────
    if (form.attending && form.guest_count === 2 && !form.companion_names.trim()) {
      setErrorMsg("Veuillez indiquer le nom de votre conjoint(e).");
      setStatus("error");
      return;
    }

    // ── Layer 2: insert — DB unique constraint is the final safety net ───────
    const { error } = await supabase.from("rsvps").insert({
      full_name: form.full_name.trim(),
      phone,
      attending: form.attending,
      guest_count: form.attending ? form.guest_count : 0,
      companion_names:
        form.attending && form.guest_count === 2
          ? form.companion_names.trim() || null
          : null,
      message: form.message.trim() || null,
    });

    if (error) {
      // PostgreSQL unique_violation — catches race conditions the pre-check missed
      if (error.code === "23505") {
        setStatus("duplicate");
        return;
      }
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
    setForm(INITIAL);
  }

  // ── Success state ────────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 animate-fade-up">
        <span className="text-[#c9a84c] text-3xl select-none">✦</span>
        <p
          className="text-[#1a1610] text-xl sm:text-2xl italic text-center leading-relaxed"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Merci, votre réponse a bien été enregistrée.
        </p>
        <p
          className="text-[#6b5a3a] text-base italic text-center"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Nous avons hâte de vous accueillir.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-[#9a8a6a] text-xs tracking-[0.3em] uppercase underline underline-offset-4 hover:text-[#c9a84c] transition-colors"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Soumettre une autre réponse
        </button>
      </div>
    );
  }

  // ── Duplicate state ──────────────────────────────────────────────────────────

  if (status === "duplicate") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-[#c9a84c]/50" />
          <span className="text-[#c9a84c] text-sm select-none">✦</span>
          <div className="h-px w-8 bg-[#c9a84c]/50" />
        </div>
        <p
          className="text-[#1a1610] text-lg sm:text-xl italic text-center leading-relaxed"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Ce numéro a déjà confirmé une présence.
        </p>
        <p
          className="text-[#6b5a3a] text-sm italic text-center max-w-xs"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Si vous souhaitez modifier votre réponse, veuillez contacter
          directement les familles.
        </p>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-[#c9a84c]/50" />
          <span className="text-[#c9a84c] text-sm select-none">✦</span>
          <div className="h-px w-8 bg-[#c9a84c]/50" />
        </div>
        <button
          onClick={() => { setStatus("idle"); setForm(INITIAL); }}
          className="mt-1 text-[#9a8a6a] text-xs tracking-[0.3em] uppercase underline underline-offset-4 hover:text-[#c9a84c] transition-colors"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Utiliser un autre numéro
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-6 animate-fade-up"
    >
      {/* Nom complet */}
      <div>
        <label className={labelClass} htmlFor="full_name">
          Nom complet <span className="text-[#c9a84c]">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          required
          placeholder="Votre nom et prénom"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Téléphone — now required for duplicate protection */}
      <div>
        <label className={labelClass} htmlFor="phone">
          Téléphone <span className="text-[#c9a84c]">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          required
          placeholder="+243 8XX XXX XXX"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Présence */}
      <div>
        <p className={labelClass}>
          Confirmez-vous votre présence ?{" "}
          <span className="text-[#c9a84c]">*</span>
        </p>
        <div className="flex gap-4">
          {(
            [
              { value: true, label: "Oui, je serai présent(e)" },
              { value: false, label: "Non, je ne pourrai pas venir" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={String(value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border cursor-pointer transition-all duration-200 text-sm text-center leading-snug ${
                form.attending === value
                  ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#1a1610]"
                  : "border-[#c9a84c]/30 bg-white/50 text-[#6b5a3a] hover:border-[#c9a84c]/60"
              }`}
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              <input
                type="radio"
                name="attending"
                className="sr-only"
                checked={form.attending === value}
                onChange={() => set("attending", value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Vous venez — only shown when attending */}
      {form.attending && (
        <div>
          <p className={labelClass}>
            Vous venez <span className="text-[#c9a84c]">*</span>
          </p>
          <div className="flex gap-4">
            {(
              [
                { value: 1, label: "Moi seul(e)" },
                { value: 2, label: "Moi + mon conjoint / ma conjointe" },
              ] as const
            ).map(({ value, label }) => (
              <label
                key={value}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 border cursor-pointer transition-all duration-200 text-sm text-center leading-snug ${
                  form.guest_count === value
                    ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#1a1610]"
                    : "border-[#c9a84c]/30 bg-white/50 text-[#6b5a3a] hover:border-[#c9a84c]/60"
                }`}
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                <input
                  type="radio"
                  name="guest_count"
                  className="sr-only"
                  checked={form.guest_count === value}
                  onChange={() => {
                    set("guest_count", value);
                    if (value === 1) set("companion_names", "");
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Spouse name — appears when attending with partner */}
      {form.attending && form.guest_count === 2 && (
        <div className="animate-fade-up">
          <label className={labelClass} htmlFor="companion_names">
            Nom du conjoint / de la conjointe{" "}
            <span className="text-[#c9a84c]">*</span>
          </label>
          <input
            id="companion_names"
            type="text"
            required
            placeholder="Nom et prénom"
            value={form.companion_names}
            onChange={(e) => set("companion_names", e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className={labelClass} htmlFor="message">
          Message{" "}
          <span className="text-[#9a8a6a] normal-case tracking-normal">
            (optionnel)
          </span>
        </label>
        <textarea
          id="message"
          rows={3}
          placeholder="Un mot pour les mariés…"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Generic error */}
      {status === "error" && (
        <p
          className="text-red-700 text-sm italic text-center"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Une erreur est survenue : {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        style={{ fontFamily: "var(--font-cormorant)" }}
        className="w-full py-4 bg-[#1a1610] text-[#e8d5a3] border border-[#1a1610] text-sm tracking-[0.25em] uppercase font-medium transition-all duration-300 hover:bg-[#c9a84c] hover:border-[#c9a84c] hover:text-[#1a1610] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {status === "loading" ? "Vérification…" : "Confirmer ma présence"}
      </button>
    </form>
  );
}
