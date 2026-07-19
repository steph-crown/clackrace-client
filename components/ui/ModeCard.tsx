import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ModeCardProps = {
  title: string;
  description: string;
  actionLabel?: string;
  accent?: "cyan" | "magenta" | "signal";
  disabled?: boolean;
  disabledLabel?: string;
  href?: string;
  onClick?: () => void;
  busy?: boolean;
};

const accentHover = {
  cyan: "hover:border-cyan/50",
  magenta: "hover:border-magenta/50",
  signal: "hover:border-signal/50",
} as const;

const accentText = {
  cyan: "text-cyan",
  magenta: "text-magenta",
  signal: "text-signal",
} as const;

export function ModeCard({
  title,
  description,
  actionLabel = "Go →",
  accent = "cyan",
  disabled = false,
  disabledLabel = "Soon",
  href,
  onClick,
  busy = false,
}: ModeCardProps) {
  const body = (
    <>
      <div>
        <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-chalk">
          {title}
        </h2>
        <p className="mt-1 text-sm text-chalk-muted">{description}</p>
      </div>
      <span
        className={cn(
          "mt-3 font-heading text-xs font-semibold uppercase tracking-wider sm:mt-0",
          disabled ? "text-chalk-muted" : accentText[accent],
        )}
      >
        {disabled ? disabledLabel : busy ? "…" : actionLabel}
      </span>
    </>
  );

  const layout =
    "flex w-full flex-col rounded-sm border px-6 py-5 text-left sm:flex-row sm:items-center sm:justify-between";

  if (disabled) {
    return (
      <div
        className={cn(
          layout,
          "border-lane/60 bg-asphalt-raised/50 opacity-60",
        )}
      >
        {body}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          layout,
          "border-lane bg-asphalt-raised transition-colors",
          accentHover[accent],
        )}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={cn(
        layout,
        "border-lane bg-asphalt-raised transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        accentHover[accent],
      )}
    >
      {body}
    </button>
  );
}
