export function GoldDivider({ wide = false }: { wide?: boolean }) {
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
