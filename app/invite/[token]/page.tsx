import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import { supabase } from "@/lib/supabase";
import InviteForm from "./InviteForm";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "700"],
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

// ─── Ornamental helpers ────────────────────────────────────────────────────

function GoldDivider({ wide = false }: { wide?: boolean }) {
  return (
    <div className="flex items-center gap-4 w-full justify-center">
      <div
        className={`h-px bg-[#c9a84c]/50 ${wide ? "w-20 sm:w-32" : "w-10 sm:w-16"}`}
      />
      <span className="text-[#c9a84c] text-xs select-none">✦</span>
      <div
        className={`h-px bg-[#c9a84c]/50 ${wide ? "w-20 sm:w-32" : "w-10 sm:w-16"}`}
      />
    </div>
  );
}

function TripleStar() {
  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="h-px w-12 sm:w-24 bg-[#c9a84c]/40" />
      <span className="text-[#c9a84c] text-[10px] tracking-[0.6em] select-none">
        ✦ ✦ ✦
      </span>
      <div className="h-px w-12 sm:w-24 bg-[#c9a84c]/40" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Server-side token lookup
  const { data: guest, error } = await supabase
    .from("guests")
    .select(
      "id, full_name, allowed_count, allow_plus_one, has_rsvped, attending, plus_one_name"
    )
    .eq("token", token)
    .single();

  const isInvalid = error || !guest;

  return (
    <div
      className={`${playfair.variable} ${cormorant.variable} min-h-screen bg-[#faf7f0] relative overflow-x-hidden`}
    >
      {/* Page-wide corner ornaments */}
      <span className="fixed top-5 left-5 w-10 h-10 border-l border-t border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />
      <span className="fixed top-5 right-5 w-10 h-10 border-r border-t border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />
      <span className="fixed bottom-5 left-5 w-10 h-10 border-l border-b border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />
      <span className="fixed bottom-5 right-5 w-10 h-10 border-r border-b border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />

      <main className="flex flex-col items-center px-6 py-16 sm:py-24 gap-14 max-w-2xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-6 text-center animate-fade-up w-full">
          <TripleStar />

          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-[10px] sm:text-xs tracking-[0.45em] uppercase font-light"
          >
            Famille MBIYE &nbsp;·&nbsp; Famille WA DIAKALENGA
          </p>

          <div className="flex flex-col items-center gap-0 leading-none">
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(2.8rem, 12vw, 6rem)",
                lineHeight: 0.92,
              }}
              className="text-[#1a1610] font-light italic"
            >
              Joël
            </h1>
            <div className="flex items-center gap-3 my-3">
              <div className="h-px w-8 sm:w-12 bg-[#c9a84c]/60" />
              <span
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(1.4rem, 5vw, 2.5rem)",
                }}
                className="text-[#c9a84c] font-light"
              >
                &amp;
              </span>
              <div className="h-px w-8 sm:w-12 bg-[#c9a84c]/60" />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(2.8rem, 12vw, 6rem)",
                lineHeight: 0.92,
              }}
              className="text-[#1a1610] font-light italic"
            >
              Patience
            </h1>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-[10px] tracking-[0.45em] uppercase"
            >
              Lundi
            </p>
            <p
              style={{ fontFamily: "var(--font-playfair)" }}
              className="text-[#c9a84c] text-2xl font-light italic"
            >
              29 Juin 2026
            </p>
          </div>

          <GoldDivider wide />
        </div>

        {/* ── Invalid token ───────────────────────────────────────────── */}
        {isInvalid && (
          <div className="flex flex-col items-center gap-5 py-10 text-center animate-fade-up w-full">
            <span className="text-[#c9a84c]/40 text-4xl select-none">✦</span>
            <p
              style={{ fontFamily: "var(--font-playfair)" }}
              className="text-[#1a1610] text-xl sm:text-2xl italic"
            >
              Invitation introuvable.
            </p>
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#6b5a3a] text-base italic max-w-sm"
            >
              Ce lien n&apos;est pas valide ou a expiré. Veuillez contacter les
              familles pour obtenir votre lien d&apos;invitation.
            </p>
            <GoldDivider />
          </div>
        )}

        {/* ── Valid invitation ────────────────────────────────────────── */}
        {!isInvalid && guest && (
          <>
            {/* Personal greeting */}
            <div className="flex flex-col items-center gap-4 text-center animate-fade-up w-full">
              <p
                style={{ fontFamily: "var(--font-cormorant)" }}
                className="text-[#9a8a6a] text-xs tracking-[0.35em] uppercase"
              >
                Invitation personnelle
              </p>
              <p
                style={{ fontFamily: "var(--font-playfair)" }}
                className="text-[#1a1610] text-2xl sm:text-3xl italic"
              >
                Bonjour{" "}
                <span className="text-[#c9a84c]">{guest.full_name}</span>
              </p>
              <p
                style={{ fontFamily: "var(--font-cormorant)" }}
                className="text-[#4a3c26] text-base sm:text-lg italic font-light leading-relaxed max-w-md"
              >
                Nous avons le bonheur de vous inviter à célébrer notre union.
                Votre présence nous serait infiniment précieuse.
              </p>
              <GoldDivider />
            </div>

            {/* Programme */}
            <div className="w-full flex flex-col gap-5 animate-fade-up">
              <h2
                style={{ fontFamily: "var(--font-playfair)" }}
                className="text-[#1a1610] text-xl sm:text-2xl font-light italic text-center"
              >
                Programme du jour
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Church */}
                <div className="relative flex flex-col items-center gap-3 p-6 border border-[#c9a84c]/30 bg-white/60 text-center">
                  <span className="absolute top-2 left-2 w-4 h-4 border-l border-t border-[#c9a84c]/50" />
                  <span className="absolute top-2 right-2 w-4 h-4 border-r border-t border-[#c9a84c]/50" />
                  <span className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-[#c9a84c]/50" />
                  <span className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-[#c9a84c]/50" />
                  <span className="text-2xl">⛪</span>
                  <p
                    style={{ fontFamily: "var(--font-playfair)" }}
                    className="text-[#1a1610] text-base font-semibold italic"
                  >
                    Consécration
                  </p>
                  <p
                    style={{ fontFamily: "var(--font-cormorant)" }}
                    className="text-[#c9a84c] text-sm tracking-widest uppercase font-medium"
                  >
                    12h30 — 13h00
                  </p>
                  <p
                    style={{ fontFamily: "var(--font-cormorant)" }}
                    className="text-[#6b5a3a] text-sm leading-snug"
                  >
                    Zoe Tabernacle Kinshasa
                    <br />
                    Av. Bolobo 121, Kinshasa
                  </p>
                </div>

                {/* Reception */}
                <div className="relative flex flex-col items-center gap-3 p-6 border border-[#c9a84c]/30 bg-white/60 text-center">
                  <span className="absolute top-2 left-2 w-4 h-4 border-l border-t border-[#c9a84c]/50" />
                  <span className="absolute top-2 right-2 w-4 h-4 border-r border-t border-[#c9a84c]/50" />
                  <span className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-[#c9a84c]/50" />
                  <span className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-[#c9a84c]/50" />
                  <span className="text-2xl">🎊</span>
                  <p
                    style={{ fontFamily: "var(--font-playfair)" }}
                    className="text-[#1a1610] text-base font-semibold italic"
                  >
                    Cérémonie dansante
                  </p>
                  <p
                    style={{ fontFamily: "var(--font-cormorant)" }}
                    className="text-[#c9a84c] text-sm tracking-widest uppercase font-medium"
                  >
                    19h00 — jusqu&apos;à l&apos;aube
                  </p>
                  <p
                    style={{ fontFamily: "var(--font-cormorant)" }}
                    className="text-[#6b5a3a] text-sm leading-snug"
                  >
                    La Servante du Seigneur
                    <br />
                    Révolution 1, Gombe
                  </p>
                </div>
              </div>

              {/* N.B. */}
              <div className="flex items-center gap-3 px-6 py-4 border border-[#c9a84c]/40 bg-[#c9a84c]/5 justify-center">
                <span className="text-[#c9a84c] text-lg select-none">✦</span>
                <p
                  style={{ fontFamily: "var(--font-cormorant)" }}
                  className="text-[#4a3c26] text-base italic font-medium"
                >
                  N.B.&nbsp;: Cadeau en espèces
                </p>
                <span className="text-[#c9a84c] text-lg select-none">✦</span>
              </div>
            </div>

            {/* RSVP Form card */}
            <div className="relative w-full animate-fade-up">
              <span className="absolute -top-2 -left-2 w-6 h-6 border-l border-t border-[#c9a84c]/50" />
              <span className="absolute -top-2 -right-2 w-6 h-6 border-r border-t border-[#c9a84c]/50" />
              <span className="absolute -bottom-2 -left-2 w-6 h-6 border-l border-b border-[#c9a84c]/50" />
              <span className="absolute -bottom-2 -right-2 w-6 h-6 border-r border-b border-[#c9a84c]/50" />

              <div className="bg-white/50 border border-[#c9a84c]/20 px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <TripleStar />
                  <h2
                    style={{ fontFamily: "var(--font-playfair)" }}
                    className="text-[#1a1610] text-2xl sm:text-3xl font-light italic"
                  >
                    Votre présence
                  </h2>
                  <GoldDivider />
                </div>

                <InviteForm guest={guest} token={token} />
              </div>
            </div>
          </>
        )}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className="w-full flex flex-col items-center gap-4 pt-8 border-t border-[#c9a84c]/20">
          <TripleStar />
          <p
            style={{ fontFamily: "var(--font-playfair)" }}
            className="text-[#1a1610] text-base sm:text-lg italic leading-relaxed text-center max-w-sm"
          >
            « Ce que Dieu a uni, que l&apos;homme ne le sépare pas »
          </p>
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-xs tracking-[0.25em] uppercase"
          >
            Matthieu 19:6
          </p>
          <TripleStar />
        </footer>
      </main>
    </div>
  );
}
