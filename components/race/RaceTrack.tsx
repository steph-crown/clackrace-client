"use client";

import { CarSvg } from "./CarSvg";

export type TrackRacer = {
  id: string;
  label: string;
  progress: number;
  bodyColor: string;
  accentColor: string;
  isYou?: boolean;
};

type RaceTrackProps = {
  racers: TrackRacer[];
};

/**
 * DOM/SVG track. Position with `left` (containing-block %) — not translateX(%),
 * which is relative to the car's own width and barely moves.
 */
export function RaceTrack({ racers }: RaceTrackProps) {
  const laneHeight = Math.max(
    56,
    Math.min(72, 320 / Math.max(racers.length, 1)),
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-sm border border-lane bg-track"
      style={{ height: racers.length * laneHeight + 16 }}
    >
      <div className="checkered-strip absolute inset-y-0 right-0 z-[1] w-3 opacity-90" />
      {racers.map((racer, i) => {
        const progress = Math.min(1, Math.max(0, racer.progress));
        return (
          <div
            key={racer.id}
            className="absolute inset-x-0"
            style={{ top: 8 + i * laneHeight, height: laneHeight - 8 }}
          >
            <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-chalk-muted/25" />
            <div
              className="absolute top-1/2 w-20 will-change-[left,transform]"
              style={{
                left: `calc(${progress * 100}% - ${progress * 5}rem)`,
                transform: "translateY(-50%)",
              }}
            >
              <CarSvg
                bodyColor={racer.bodyColor}
                accentColor={racer.accentColor}
                label={racer.isYou ? "You" : racer.label}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
