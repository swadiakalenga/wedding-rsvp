import { GoldDivider } from "./GoldDivider";

type Props = {
  icon: string;
  title: string;
  venueLabel?: string;
  venueName?: string;
  time: string;
  place: string;
  refs: string[];
  delay?: string;
  compact?: boolean;
};

export function CeremonyCard({
  icon,
  title,
  venueLabel,
  venueName,
  time,
  place,
  refs,
  delay = "0ms",
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div className="relative flex flex-col items-center gap-3 p-6 border border-[#c9a84c]/30 bg-white/60 text-center">
        <span className="absolute top-2 left-2 w-4 h-4 border-l border-t border-[#c9a84c]/50" />
        <span className="absolute top-2 right-2 w-4 h-4 border-r border-t border-[#c9a84c]/50" />
        <span className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-[#c9a84c]/50" />
        <span className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-[#c9a84c]/50" />

        <span className="text-2xl">{icon}</span>

        <p
          style={{ fontFamily: "var(--font-playfair)" }}
          className="text-[#1a1610] text-base font-semibold italic"
        >
          {title}
        </p>

        <p
          style={{ fontFamily: "var(--font-cormorant)" }}
          className="text-[#c9a84c] text-sm tracking-widest uppercase font-medium"
        >
          {time}
        </p>

        {venueLabel && (
          <p
            style={{ fontFamily: "var(--font-cormorant)" }}
            className="text-[#9a8a6a] text-[10px] tracking-[0.35em] uppercase"
          >
            {venueLabel}
          </p>
        )}

        <p
          style={{ fontFamily: "var(--font-cormorant)" }}
          className="text-[#6b5a3a] text-sm leading-snug"
        >
          {venueName && (
            <>
              {venueName}
              <br />
            </>
          )}
          {place}
        </p>

        {refs.length > 0 && (
          <ul className="flex flex-col gap-0.5 text-center">
            {refs.map((ref) => (
              <li
                key={ref}
                style={{ fontFamily: "var(--font-cormorant)" }}
                className="text-[#6b5a3a] text-xs italic leading-relaxed"
              >
                {ref}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col items-center gap-5 p-8 sm:p-10 border border-[#c9a84c]/30 bg-white/60 backdrop-blur-sm animate-fade-up"
      style={{ animationDelay: delay }}
    >
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
