"use client";

import type { CpuDifficulty } from "@/lib/cpu/simulate";
import { raceAudio } from "@/lib/audio/manager";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { cn } from "@/lib/utils/cn";
import { RaceChrome } from "../RaceChrome";

type SoloSetupProps = {
  difficulty: CpuDifficulty;
  cpuCount: number;
  onDifficultyChange: (d: CpuDifficulty) => void;
  onCpuCountChange: (n: number) => void;
  onStart: () => void;
};

export function SoloSetup({
  difficulty,
  cpuCount,
  onDifficultyChange,
  onCpuCountChange,
  onStart,
}: SoloSetupProps) {
  return (
    <PageShell
      centered
      logoHref="/play"
      headerRight={<RaceChrome currentMode="solo" />}
    >
      <Eyebrow>Race CPU</Eyebrow>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        Solo setup
      </h1>
      <p className="mt-3 max-w-lg text-sm text-chalk-muted sm:text-base">
        Pick difficulty and how many CPU racers, then go.
      </p>

      <div className="mt-12 space-y-8">
        <div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
            Difficulty
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDifficultyChange(d)}
                className={cn(
                  "rounded-sm border px-3 py-4 font-heading text-sm font-semibold uppercase tracking-wider",
                  difficulty === d
                    ? "border-cyan bg-cyan/10 text-cyan"
                    : "border-lane text-chalk hover:border-chalk/40",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
            CPU racers — {cpuCount}
          </p>
          <input
            type="range"
            min={1}
            max={7}
            value={cpuCount}
            onChange={(e) => onCpuCountChange(Number(e.target.value))}
            className="mt-4 w-full accent-cyan"
          />
        </div>

        <Button
          type="button"
          size="lg"
          onClick={() => {
            void raceAudio.ensureUnlocked();
            onStart();
          }}
          className="sm:min-w-[220px]"
        >
          Start race
        </Button>
      </div>
    </PageShell>
  );
}
