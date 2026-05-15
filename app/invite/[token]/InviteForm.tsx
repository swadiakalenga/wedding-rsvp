"use client";

import { useState } from "react";

type Guest = {
  id: string;
  full_name: string;
  allowed_count: number;
  allow_plus_one: boolean;
  has_rsvped: boolean;
  attending: boolean | null;
  plus_one_name: string | null;
};

type Status = "idle" | "loading" | "success" | "error" | "already_rsvped";

// ─── Shared styles ─────────────────────────────────────────────────────────

const inputClass =
  "w-full bg-white/70 border border-[#c9a84c]/40 px-4 py-3 text-[#1a1610] " +
  "placeholder:text-[#9a8a6a]/60 focus:outline-none focus:border-[#c9a84c] " +
  "focus:bg-white transition-colors duration-200 text-base";

const labelClass =
  "block text-[#4a3c26] text-xs tracking-[0.25em] uppercase mb-2 font-medium";

// ─── Ornaments ─────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#c9a84c]/30" />
      <span className="text-[#c9a84c]/60 text-[10px] select-none">✦</span>
      <div className="h-px flex-1 bg-[#c9a84c]/30" />
    </div>
  );
}

// ─── Already-responded state ───────────────────────────────────────────────

function AlreadyRsvped({ guest }: { guest: Guest }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 animate-fade-up text-center">
      <span className="text-[#c9a84c] text-3xl select-none">✦</span>
      <p
        className="text-[#1a1610] text-xl sm:text-2xl italic leading-relaxed"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Votre réponse a déjà été enregistrée.
      </p>
      {guest.attending !== null && (
        <p
          className="text-[#6b5a3a] text-base italic"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {guest.attending
            ? "Vous avez confirmé votre présence. Nous avons hâte de vous accueillir !"
            : "Vous avez indiqué ne pas pouvoir venir. Merci d'avoir répondu."}
        </p>
      )}
      <Divider />
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────

export default function InviteForm({
  guest,
  token,
}: {
  guest: Guest;
  token: string;
}) {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [plusOneName, setPlusOneName] = useState("");
  const [status, setStatus] = useState<Status>(
    guest.has_rsvped ? "already_rsvped" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  // ── Already responded ──────────────────────────────────────────────────
  if (status === "already_rsvped") {
    return <AlreadyRsvped guest={guest} />;
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 animate-fade-up text-center">
        <span className="text-[#c9a84c] text-3xl select-none">✦</span>
        <p
          className="text-[#1a1610] text-xl sm:text-2xl italic leading-relaxed"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {attending
            ? "Merci ! Votre présence est confirmée."
            : "Merci d'avoir répondu. Vous nous manquerez."}
        </p>
        {attending && (
          <p
            className="text-[#6b5a3a] text-base italic"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Nous avons hâte de vous accueillir le{" "}
            <strong className="not-italic font-semibold">29 Juin 2026</strong>.
          </p>
        )}
        <Divider />
      </div>
    );
  }

  // ── Submit handler ─────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (attending === null) {
      setErrorMsg("Veuillez sélectionner Oui ou Non.");
      return;
    }

    if (attending && guest.allow_plus_one && !plusOneName.trim()) {
      setErrorMsg("Le nom du conjoint / de la conjointe est requis.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const res = await fetch(`/api/invite/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attending,
        plus_one_name: attending && guest.allow_plus_one ? plusOneName.trim() : null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        setStatus("already_rsvped");
        return;
      }
      setStatus("error");
      setErrorMsg(json.error ?? "Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setStatus("success");
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-6 animate-fade-up"
    >
      {/* Presence question */}
      <div>
        <p className={labelClass}>
          Confirmez-vous votre présence ?{" "}
          <span className="text-[#c9a84c]">*</span>
        </p>
        <div className="flex gap-4">
          {(
            [
              { value: true, label: "Oui" },
              { value: false, label: "Non" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => {
                setAttending(value);
                setErrorMsg("");
                if (!value) setPlusOneName("");
              }}
              style={{ fontFamily: "var(--font-cormorant)" }}
              className={`flex-1 py-4 text-base sm:text-lg tracking-[0.25em] uppercase border transition-all duration-200 ${
                attending === value
                  ? "bg-[#1a1610] text-[#e8d5a3] border-[#1a1610]"
                  : "bg-white/50 text-[#6b5a3a] border-[#c9a84c]/40 hover:border-[#c9a84c] hover:bg-[#c9a84c]/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* +1 field — only when attending AND allow_plus_one */}
      {attending === true && guest.allow_plus_one && (
        <div className="animate-fade-up">
          <label className={labelClass} htmlFor="plus_one_name">
            Nom du conjoint / de la conjointe{" "}
            <span className="text-[#c9a84c]">*</span>
          </label>
          <input
            id="plus_one_name"
            type="text"
            required
            placeholder="Nom et prénom"
            value={plusOneName}
            onChange={(e) => {
              setPlusOneName(e.target.value);
              setErrorMsg("");
            }}
            className={inputClass}
          />
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <p
          className="text-red-700 text-sm italic text-center"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {errorMsg}
        </p>
      )}
      {errorMsg && status === "idle" && (
        <p
          className="text-red-700 text-sm italic text-center"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading" || attending === null}
        style={{ fontFamily: "var(--font-cormorant)" }}
        className="w-full py-4 bg-[#1a1610] text-[#e8d5a3] border border-[#1a1610] text-sm tracking-[0.3em] uppercase font-medium transition-all duration-300 hover:bg-[#c9a84c] hover:border-[#c9a84c] hover:text-[#1a1610] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {status === "loading" ? "Envoi en cours…" : "Confirmer ma réponse"}
      </button>
    </form>
  );
}
