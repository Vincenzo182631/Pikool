/**
 * Dark "season stats" card from the design handoff — three figures with the
 * wins column picked out in accent, plus a decorative accent disc.
 */
export function SeasonStats({
  matches,
  wins,
  rating,
}: {
  matches: number;
  wins: number;
  rating: number | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-ink p-[18px] text-white">
      <span
        aria-hidden
        className="absolute -right-10 -top-12 size-[130px] rounded-full bg-primary opacity-10"
      />
      <div className="relative grid grid-cols-3 gap-3">
        <Stat value={String(matches)} label="Matches" />
        <Stat value={String(wins)} label="Wins" accent />
        <Stat value={rating !== null ? rating.toFixed(1) : "—"} label="Rating" />
      </div>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <p
        className={`font-display text-[32px] font-extrabold leading-none ${
          accent ? "text-primary" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/60">{label}</p>
    </div>
  );
}
