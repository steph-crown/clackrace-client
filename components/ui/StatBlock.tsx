import { cn } from "@/lib/utils/cn";

type StatBlockProps = {
  label: string;
  value: string;
  accent?: "cyan" | "signal" | "chalk";
  /** Short clarifying line under the value (e.g. rating tier). */
  hint?: string;
};

const accentClass = {
  cyan: "text-cyan",
  signal: "text-signal",
  chalk: "text-chalk",
} as const;

export function StatBlock({
  label,
  value,
  accent = "chalk",
  hint,
}: StatBlockProps) {
  return (
    <div>
      <dt className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
        {label}
      </dt>
      <dd
        className={cn(
          "font-heading text-3xl font-bold",
          accentClass[accent],
        )}
        title={hint}
      >
        {value}
      </dd>
      {hint ? (
        <p className="mt-1 text-[10px] leading-snug text-chalk-muted">{hint}</p>
      ) : null}
    </div>
  );
}
