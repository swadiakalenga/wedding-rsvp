import { CeremonyCard } from "./CeremonyCard";

const CHURCH = {
  icon: "⛪",
  title: "Consécration du mariage",
  venueName: "Zoe Tabernacle Kinshasa",
  time: "12h30 — 13h00",
  place: "Avenue Bolobo 121, commune de Kinshasa",
  refs: [
    "Derrière le Stade des Martyrs",
    "Station Cobil sur Kasa-Vubu",
  ],
};

const RECEPTION = {
  icon: "🎊",
  title: "Cérémonie dansante",
  venueLabel: "Salle de fête",
  venueName: "La Servante du Seigneur",
  time: "19h00 — jusqu'à l'aube",
  place: "Révolution 1, commune de la Gombe",
  refs: [
    "Nouveau bâtiment de l'Église Philadelphie",
    "En allant vers le rond-point SAFRICAS",
    "Immeuble du coin de l'avenue Révolution",
    "Juste après la salle Maranatha",
  ],
};

/**
 * Renders both ceremony cards and the N.B. note as a React Fragment.
 * Because there is no wrapper element, the parent's flex/grid gap applies
 * naturally to each child — keeping spacing consistent on "/" and "/invite/[token]".
 *
 * compact=false  →  full-size cards used on the public homepage "/"
 * compact=true   →  smaller cards used on the personalised invite page
 */
export function WeddingProgram({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div
        className={
          compact
            ? "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
            : "grid grid-cols-1 lg:grid-cols-2 gap-8 w-full"
        }
      >
        <CeremonyCard {...CHURCH} delay="0ms" compact={compact} />
        <CeremonyCard {...RECEPTION} delay="120ms" compact={compact} />
      </div>

      {compact ? (
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
      ) : (
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
      )}
    </>
  );
}
