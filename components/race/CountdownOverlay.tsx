"use client";

type CountdownOverlayProps = {
  value: number | "GO" | null;
};

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  if (value === null) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-asphalt/55">
      <p
        key={String(value)}
        className="countdown-pop font-logo text-7xl text-cyan sm:text-8xl"
      >
        {value}
      </p>
    </div>
  );
}
