import { RaceLane } from "./RaceLane";

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

/** DOM/SVG track. Finish flag on the right; cars face right toward it. */
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
      {racers.map((racer, i) => (
        <RaceLane
          key={racer.id}
          racer={racer}
          top={8 + i * laneHeight}
          height={laneHeight - 8}
        />
      ))}
    </div>
  );
}
