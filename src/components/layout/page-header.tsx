/**
 * Standard screen header. The title always renders in the display face
 * (Fraunces italic) — that's the brand's signature typographic move.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  /** Small muted line above the title (e.g. "Season 2026"). */
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1.5 text-xs text-muted-foreground">{eyebrow}</p>}
        <h1 className="font-display text-[30px] font-extrabold leading-none tracking-[-0.03em] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
