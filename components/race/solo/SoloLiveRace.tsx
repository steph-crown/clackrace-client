"use client";

import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { CountdownOverlay } from "@/components/race/CountdownOverlay";
import { RaceHud } from "@/components/race/RaceHud";
import { RaceTrack, type TrackRacer } from "@/components/race/RaceTrack";
import { TypingPanel } from "@/components/race/TypingPanel";
import { RaceChrome } from "../RaceChrome";

type SoloLiveRaceProps = {
  countdown: number | "GO" | null;
  racers: TrackRacer[];
  wpm: number;
  accuracy: number;
  passage: string;
  typed: string;
  typingEnabled: boolean;
  onChar: (char: string) => void;
  onBackspace: () => void;
  onRestart: () => void;
};

export function SoloLiveRace({
  countdown,
  racers,
  wpm,
  accuracy,
  passage,
  typed,
  typingEnabled,
  onChar,
  onBackspace,
  onRestart,
}: SoloLiveRaceProps) {
  return (
    <main className="asphalt-grain relative flex min-h-dvh flex-col px-5 py-6 sm:px-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Logo href="/play" size="sm" />
        <div className="flex items-center gap-3">
          <RaceHud wpm={wpm} accuracy={accuracy} />
          <RaceChrome
            currentMode="solo"
            compact
            extras={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRestart}
              >
                Restart
              </Button>
            }
          />
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-4xl flex-1">
        <CountdownOverlay value={countdown} />
        <RaceTrack racers={racers} />
        <div className="mt-6">
          <TypingPanel
            passage={passage}
            typed={typed}
            enabled={typingEnabled}
            onChar={onChar}
            onBackspace={onBackspace}
          />
        </div>
      </div>
    </main>
  );
}
