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

/**
 * Flat side-view car — nose + headlight on the +X side of the viewBox (right).
 * `facing="left"` mirrors with scale-x.
 */
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
          // Art is drawn facing right; only mirror when we want left.
          facing === "left" && "-scale-x-100",
        )}
        aria-hidden
      >
        <ellipse cx="60" cy="44" rx="42" ry="3" fill="rgb(0 0 0 / 0.35)" />
        {/* Cabin + body — vertical rear on the left, pointed nose on the right */}
        <path
          d="M16 32 V22 L24 14 H48 L58 10 H78 L98 16 L110 24 V34 H16 Z"
          fill={bodyColor}
        />
        {/* Cabin glass */}
        <path d="M50 14 L58 11 H76 L88 18 H54 Z" fill="rgb(12 14 18 / 0.55)" />
        {/* Accent stripe */}
        <rect x="28" y="24" width="70" height="3" rx="1" fill={accentColor} />
        {/* Rear wheel (left) */}
        <circle cx="38" cy="34" r="8" fill="#1a1a1a" />
        <circle cx="38" cy="34" r="4" fill="#4a4a4a" />
        {/* Front wheel (right) */}
        <circle cx="92" cy="34" r="8" fill="#1a1a1a" />
        <circle cx="92" cy="34" r="4" fill="#4a4a4a" />
        {/* Headlight on the nose (right) */}
        <circle cx="108" cy="26" r="3" fill={accentColor} />
        <circle cx="108" cy="26" r="1.25" fill="#fff8c8" opacity="0.85" />
      </svg>
    </div>
  );
}
