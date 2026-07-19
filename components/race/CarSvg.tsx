import { cn } from "@/lib/utils/cn";

export type CarFacing = "right" | "left";

type CarSvgProps = {
  className?: string;
  bodyColor?: string;
  accentColor?: string;
  label?: string;
  /**
   * Track runs left → right; finish is on the right.
   * Cars face the finish by default (`right`). Use `left` only for mirrored scenes.
   */
  facing?: CarFacing;
};

/** Flat side-view car — nose points toward `facing`. One body, CSS-recolorable. */
export function CarSvg({
  className,
  bodyColor = "var(--car-body)",
  accentColor = "var(--car-accent)",
  label,
  facing = "right",
}: CarSvgProps) {
  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center",
        className,
      )}
    >
      {label ? (
        <span className="mb-1 rounded bg-asphalt/80 px-1.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wider text-chalk">
          {label}
        </span>
      ) : null}
      <svg
        viewBox="0 0 120 48"
        className={cn(
          "h-auto w-full drop-shadow-[0_2px_8px_rgb(0_0_0_/0.45)]",
          facing === "left" && "-scale-x-100",
        )}
        aria-hidden
      >
        <ellipse cx="60" cy="44" rx="42" ry="3" fill="rgb(0 0 0 / 0.35)" />
        {/* Body — nose / headlight on the right (+X) */}
        <path
          d="M18 30 L28 18 H52 L62 12 H88 L104 22 V34 H18 Z"
          fill={bodyColor}
        />
        <path d="M54 18 L62 14 H84 L92 22 H58 Z" fill="rgb(12 14 18 / 0.55)" />
        <rect x="30" y="24" width="58" height="3" rx="1" fill={accentColor} />
        <circle cx="36" cy="34" r="8" fill="#1a1a1a" />
        <circle cx="36" cy="34" r="4" fill="#4a4a4a" />
        <circle cx="92" cy="34" r="8" fill="#1a1a1a" />
        <circle cx="92" cy="34" r="4" fill="#4a4a4a" />
        <circle cx="104" cy="26" r="2.5" fill={accentColor} />
      </svg>
    </div>
  );
}
