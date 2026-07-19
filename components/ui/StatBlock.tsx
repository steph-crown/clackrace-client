import { cn } from "@/lib/utils/cn";

type StatBlockProps = {
  label: string;
  value: string;
  accent?: "cyan" | "signal" | "chalk";
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
      >
        {value}
      </dd>
    </div>
  );
}
