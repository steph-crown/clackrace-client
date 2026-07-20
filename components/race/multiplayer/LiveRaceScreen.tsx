"use client";

import { Logo } from "@/components/ui/Logo";
import { Toast } from "@/components/ui/Toast";
import { CountdownOverlay } from "@/components/race/CountdownOverlay";
import { FinishedWaiting } from "@/components/race/FinishedWaiting";
import { RaceChrome } from "@/components/race/RaceChrome";
import { RaceHud } from "@/components/race/RaceHud";
import { RaceTrack, type TrackRacer } from "@/components/race/RaceTrack";
import { TypingPanel } from "@/components/race/TypingPanel";

type LiveRaceScreenProps = {
  toast?: string | null;
  countdown: number | "GO" | null;
  racers: TrackRacer[];
  wpm: number;
  accuracy: number;
  localFinished: boolean;
  passage: string | null;
  typed: string;
  typingEnabled: boolean;
  currentMode?: "public" | "quick" | "challenge";
  onChar: (char: string) => void;
  onBackspace: () => void;
};

export function LiveRaceScreen({
  toast,
  countdown,
  racers,
  wpm,
  accuracy,
  localFinished,
  passage,
  typed,
  typingEnabled,
  currentMode = "public",
  onChar,
  onBackspace,
}: LiveRaceScreenProps) {
  return (
    <main className="asphalt-grain relative flex min-h-dvh flex-col px-5 py-6 sm:px-8">
      {toast ? <Toast message={toast} /> : null}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Logo href="/play" size="sm" />
        <div className="flex items-center gap-3">
          <RaceHud wpm={wpm} accuracy={accuracy} />
          <RaceChrome currentMode={currentMode} compact />
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-4xl flex-1">
        <CountdownOverlay value={countdown} />
        <RaceTrack racers={racers} />
        <div className="mt-6">
          {localFinished ? (
            <FinishedWaiting />
          ) : passage ? (
            <TypingPanel
              passage={passage}
              typed={typed}
              enabled={typingEnabled}
              onChar={onChar}
              onBackspace={onBackspace}
            />
          ) : (
            <p className="text-center text-sm text-chalk-muted">Get ready…</p>
          )}
        </div>
      </div>
    </main>
  );
}
