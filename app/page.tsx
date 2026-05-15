import { Playfair_Display, Cormorant_Garamond } from "next/font/google";

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

// ─── Ornamental helpers ────────────────────────────────────────────────────────

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

// ─── Ceremony card ─────────────────────────────────────────────────────────────

function CeremonyCard({
  icon,
  title,
  venueLabel,
  venueName,
  time,
  place,
  refs,
  delay,
}: {
  icon: string;
  title: string;
  venueLabel?: string;
  venueName?: string;
  time: string;
  place: string;
  refs: string[];
  delay: string;
}) {
  return (
    <div
      className="relative flex flex-col items-center gap-5 p-8 sm:p-10 border border-[#c9a84c]/30 bg-white/60 backdrop-blur-sm animate-fade-up"
      style={{ animationDelay: delay }}
    >
      {/* corner accents */}
      <span className="absolute top-3 left-3 w-5 h-5 border-l border-t border-[#c9a84c]/50" />
      <span className="absolute top-3 right-3 w-5 h-5 border-r border-t border-[#c9a84c]/50" />
      <span className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-[#c9a84c]/50" />
      <span className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-[#c9a84c]/50" />

      <span className="text-3xl">{icon}</span>

      <h3
        style={{ fontFamily: "var(--font-playfair)" }}
        className="text-[#1a1610] text-xl sm:text-2xl font-semibold italic text-center leading-tight"
      >
        {title}
      </h3>

      <GoldDivider />

      {(venueLabel || venueName) && (
        <div className="flex flex-col items-center gap-1">
          {venueLabel && (
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-[10px] tracking-[0.35em] uppercase"
            >
              {venueLabel}
            </p>
          )}
          {venueName && (
            <p
              style={{ fontFamily: "var(--font-playfair)" }}
              className="text-[#1a1610] text-base sm:text-lg font-medium italic text-center leading-snug"
            >
              {venueName}
            </p>
          )}
        </div>
      )}

      <p
        style={{ fontFamily: "var(--font-cormorant)" }}
        className="text-[#c9a84c] text-lg sm:text-xl font-medium tracking-widest uppercase"
      >
        {time}
      </p>

      <p
        style={{ fontFamily: "var(--font-cormorant)" }}
        className="text-[#1a1610] text-base sm:text-lg font-semibold text-center leading-snug"
      >
        {place}
      </p>

      <ul className="flex flex-col gap-1 text-center">
        {refs.map((ref) => (
          <li
            key={ref}
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#6b5a3a] text-sm sm:text-base italic leading-relaxed"
          >
            {ref}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div
      className={`${playfair.variable} ${cormorant.variable} flex-1 bg-[#faf7f0] relative overflow-x-hidden`}
    >
      {/* ── Page-wide corner ornaments ── */}
      <span className="fixed top-5 left-5 w-10 h-10 border-l border-t border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />
      <span className="fixed top-5 right-5 w-10 h-10 border-r border-t border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />
      <span className="fixed bottom-5 left-5 w-10 h-10 border-l border-b border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />
      <span className="fixed bottom-5 right-5 w-10 h-10 border-r border-b border-[#c9a84c]/40 pointer-events-none z-50 hidden sm:block" />

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center relative">
        {/* subtle radial bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, #f5ede0 0%, #faf7f0 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-7 max-w-2xl mx-auto animate-fade-up">
          <TripleStar />

          {/* Family names */}
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-xs sm:text-sm tracking-[0.45em] uppercase font-light"
          >
            Famille MBIYE &nbsp;·&nbsp; Famille WA DIAKALENGA
          </p>

          {/* Hero names */}
          <div className="flex flex-col items-center gap-0 leading-none">
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(3.2rem, 14vw, 7.5rem)",
                lineHeight: 0.92,
              }}
              className="text-[#1a1610] font-light italic"
            >
              Joël
            </h1>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px w-8 sm:w-14 bg-[#c9a84c]/60" />
              <span
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(1.6rem, 6vw, 3rem)",
                }}
                className="text-[#c9a84c] font-light"
              >
                &amp;
              </span>
              <div className="h-px w-8 sm:w-14 bg-[#c9a84c]/60" />
            </div>

            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(3.2rem, 14vw, 7.5rem)",
                lineHeight: 0.92,
              }}
              className="text-[#1a1610] font-light italic"
            >
              Patience
            </h1>
          </div>

          {/* Full names */}
          <div
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="flex flex-col items-center gap-1 text-[#6b5a3a] text-sm sm:text-base tracking-[0.12em] uppercase font-light"
          >
            <span>Joël ILUNGA MBIYE</span>
            <span className="text-[#c9a84c]/60 text-xs">—</span>
            <span>Patience MBUYI WA DIAKALENGA</span>
          </div>

          {/* Wedding date */}
          <div className="flex flex-col items-center gap-1.5">
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-[10px] tracking-[0.45em] uppercase"
            >
              Lundi
            </p>
            <p
              style={{ fontFamily: "var(--font-playfair)" }}
              className="text-[#c9a84c] text-2xl sm:text-3xl font-light italic"
            >
              29 Juin 2026
            </p>
          </div>

          <GoldDivider wide />

          {/* CTA button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full max-w-md">
            <a
              href="#lieux"
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="flex-1 flex items-center justify-center px-8 py-4 bg-[#1a1610] text-[#e8d5a3] border border-[#1a1610] text-sm sm:text-base tracking-[0.25em] uppercase font-medium transition-all duration-400 hover:bg-[#c9a84c] hover:border-[#c9a84c] hover:text-[#1a1610] hover:scale-[1.02] active:scale-[0.98]"
            >
              Voir les lieux
            </a>
          </div>

          <TripleStar />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CEREMONY SECTIONS
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="lieux"
        className="px-6 py-20 sm:py-28 flex flex-col items-center gap-16 max-w-5xl mx-auto w-full"
      >
        {/* Section header */}
        <div className="flex flex-col items-center gap-5 text-center animate-fade-up">
          <TripleStar />
          <h2
            style={{ fontFamily: "var(--font-playfair)" }}
            className="text-[#1a1610] text-3xl sm:text-4xl md:text-5xl font-light italic"
          >
            Programme du jour
          </h2>
          <GoldDivider wide />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <CeremonyCard
            icon="⛪"
            title="Consécration du mariage"
            venueName="Zoe Tabernacle Kinshasa"
            time="12h30 — 13h00"
            place="Avenue Bolobo 121, commune de Kinshasa"
            refs={[
              "Derrière le Stade des Martyrs",
              "Station Cobil sur Kasa-Vubu",
            ]}
            delay="0ms"
          />
          <CeremonyCard
            icon="🎊"
            title="Cérémonie dansante"
            venueLabel="Salle de fête"
            venueName="La Servante du Seigneur"
            time="19h00 — jusqu'à l'aube"
            place="Révolution 1, commune de la Gombe"
            refs={[
              "Nouveau bâtiment de l'Église Philadelphie",
              "En allant vers le rond-point SAFRICAS",
              "Immeuble du coin de l'avenue Révolution",
              "Juste après la salle Maranatha",
            ]}
            delay="120ms"
          />
        </div>

        {/* NB note */}
        <div
          className="flex items-center gap-4 px-8 py-5 border border-[#c9a84c]/40 bg-[#c9a84c]/5 animate-fade-up w-full sm:w-auto"
          style={{ animationDelay: "240ms" }}
        >
          <span className="text-[#c9a84c] text-xl select-none">✦</span>
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#4a3c26] text-base sm:text-lg italic font-medium tracking-wide"
          >
            N.B.&nbsp;: Cadeau en espèces
          </p>
          <span className="text-[#c9a84c] text-xl select-none">✦</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          RSVP SECTION — invitation personnalisée uniquement
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="rsvp"
        className="px-6 py-20 sm:py-28 flex flex-col items-center gap-12"
        style={{
          background:
            "linear-gradient(180deg, #faf7f0 0%, #f5ede0 50%, #faf7f0 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center animate-fade-up">
          <TripleStar />
          <h2
            style={{ fontFamily: "var(--font-playfair)" }}
            className="text-[#1a1610] text-3xl sm:text-4xl md:text-5xl font-light italic"
          >
            Votre présence
          </h2>
          <GoldDivider wide />
        </div>

        <div className="relative w-full max-w-lg">
          <span className="absolute -top-2 -left-2 w-6 h-6 border-l border-t border-[#c9a84c]/50" />
          <span className="absolute -top-2 -right-2 w-6 h-6 border-r border-t border-[#c9a84c]/50" />
          <span className="absolute -bottom-2 -left-2 w-6 h-6 border-l border-b border-[#c9a84c]/50" />
          <span className="absolute -bottom-2 -right-2 w-6 h-6 border-r border-b border-[#c9a84c]/50" />

          <div className="bg-white/50 border border-[#c9a84c]/20 px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center gap-6 text-center">
            <span className="text-[#c9a84c] text-3xl select-none">✦</span>
            <p
              style={{ fontFamily: "var(--font-playfair)" }}
              className="text-[#1a1610] text-xl sm:text-2xl italic leading-relaxed"
            >
              Les confirmations se font via votre lien d&apos;invitation personnalisé.
            </p>
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#6b5a3a] text-base sm:text-lg italic font-light leading-relaxed max-w-sm"
            >
              Vous avez reçu un lien unique par message. Ouvrez-le pour confirmer
              votre présence en quelques secondes.
            </p>
            <GoldDivider wide />
            <p
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[#9a8a6a] text-sm italic"
            >
              Vous n&apos;avez pas reçu votre lien ? Contactez les familles directement.
            </p>
          </div>
        </div>

        <TripleStar />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="flex flex-col items-center gap-4 py-12 px-6 text-center border-t border-[#c9a84c]/20">
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-[#c9a84c]/30" />
          <span className="text-[#c9a84c]/50 text-[10px] select-none">✦</span>
          <div className="h-px w-10 bg-[#c9a84c]/30" />
        </div>
        <p
          style={{ fontFamily: "var(--font-playfair)" }}
          className="text-[#1a1610] text-lg sm:text-xl italic leading-relaxed max-w-sm"
        >
          « Ce que Dieu a uni, que l&apos;homme ne le sépare pas »
        </p>
        <p
          style={{ fontFamily: "var(--font-cormorant)" }}
          className="text-[#9a8a6a] text-sm tracking-[0.25em] uppercase"
        >
          Matthieu 19:6
        </p>
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-[#c9a84c]/30" />
          <span className="text-[#c9a84c]/50 text-[10px] select-none">✦</span>
          <div className="h-px w-10 bg-[#c9a84c]/30" />
        </div>
      </footer>
    </div>
  );
}
