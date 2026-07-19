import { CarSvg } from "./CarSvg";
import type { TrackRacer } from "./RaceTrack";

type RaceLaneProps = {
  racer: TrackRacer;
  top: number;
  height: number;
};

/** Single lane — car faces finish (right). Position via `left` %, not translateX(%). */
export function RaceLane({ racer, top, height }: RaceLaneProps) {
  const progress = Math.min(1, Math.max(0, racer.progress));

  return (
    <div className="absolute inset-x-0" style={{ top, height }}>
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
          facing="right"
        />
      </div>
    </div>
  );
}
