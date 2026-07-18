"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPassages, submitSoloResult } from "@/lib/api/client";
import {
  createCpuRacers,
  tickCpu,
  type CpuDifficulty,
  type CpuRacer,
} from "@/lib/cpu/simulate";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";
import {
  pickPassage,
  type Passage,
  type PassageDifficulty,
} from "@/lib/passages";
import { buildSoloResults, type RacerResult } from "@/lib/race/results";
import {
  applyBackspace,
  applyKey,
  computeAccuracy,
  computeWpm,
  createTypingState,
  progressOf,
  type TypingState,
} from "@/lib/typing/engine";
import { CountdownOverlay } from "./CountdownOverlay";
import { RaceTrack, type TrackRacer } from "./RaceTrack";
import { ResultScreen } from "./ResultScreen";
import { TypingPanel } from "./TypingPanel";

type Phase = "setup" | "countdown" | "racing" | "results";

const PLAYER_CAR = {
  bodyColor: "var(--cyan)",
  accentColor: "var(--signal)",
};

export function SoloRaceApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<CpuDifficulty>("medium");
  const [cpuCount, setCpuCount] = useState(3);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [cpus, setCpus] = useState<CpuRacer[]>([]);
  const [countdown, setCountdown] = useState<number | "GO" | null>(null);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [results, setResults] = useState<RacerResult[]>([]);
  const [submitted, setSubmitted] = useState<boolean | null>(null);

  const cpusRef = useRef<CpuRacer[]>([]);
  const typingRef = useRef<TypingState | null>(null);
  const raceStartPerfRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    void fetchPassages().then(setPassages);
  }, []);

  useEffect(() => {
    typingRef.current = typing;
  }, [typing]);

  useEffect(() => {
    cpusRef.current = cpus;
  }, [cpus]);

  const trackRacers: TrackRacer[] = useMemo(() => {
    if (!typing) return [];
    const player: TrackRacer = {
      id: "you",
      label: "You",
      progress: progressOf(typing),
      bodyColor: PLAYER_CAR.bodyColor,
      accentColor: PLAYER_CAR.accentColor,
      isYou: true,
    };
    const bots: TrackRacer[] = cpus.map((c) => ({
      id: c.id,
      label: c.name.replace("CPU ", ""),
      progress: passage ? c.correctIndex / passage.text.length : 0,
      bodyColor: c.bodyColor,
      accentColor: c.accentColor,
    }));
    return [player, ...bots];
  }, [typing, cpus, passage]);

  const finishRace = useCallback(
    (finalTyping: TypingState, finalCpus: CpuRacer[]) => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const raceStart = raceStartPerfRef.current;
      const elapsed = raceStart != null ? performance.now() - raceStart : 0;
      const playerFinishElapsed =
        finalTyping.finishedAtMs != null && raceStart != null
          ? finalTyping.finishedAtMs - raceStart
          : null;
      const ranked = buildSoloResults(
        finalTyping,
        finalCpus,
        elapsed,
        playerFinishElapsed,
      );
      setResults(ranked);
      setPhase("results");

      const you = ranked.find((r) => r.isYou);
      if (!you || !passage) return;

      const durationMs =
        finalTyping.finishedAtMs != null && finalTyping.startedAtMs != null
          ? finalTyping.finishedAtMs - finalTyping.startedAtMs
          : elapsed;

      void submitSoloResult({
        passageId: passage.id,
        guestSessionToken: getOrCreateGuestSessionToken(),
        carColor: "#2ee6d6",
        finalWpm: you.wpm,
        finalAccuracy: you.accuracy,
        placement: you.placement,
        participantCount: ranked.length,
        cpuDifficulty: difficulty,
        cpuCount: finalCpus.length,
        durationMs: Math.round(durationMs),
        mistakes: finalTyping.mistakes,
        keystrokes: finalTyping.keystrokes,
        passageLength: passage.text.length,
      }).then((res) => setSubmitted(res.ok));
    },
    [passage, difficulty],
  );

  const startLoop = useCallback(() => {
    lastFrameRef.current = performance.now();
    raceStartPerfRef.current = performance.now();

    const loop = (now: number) => {
      const dt = now - lastFrameRef.current;
      lastFrameRef.current = now;
      const start = raceStartPerfRef.current ?? now;
      const elapsed = now - start;
      const passageLen = typingRef.current?.passage.length ?? 0;

      const nextCpus = cpusRef.current.map((c) =>
        tickCpu(c, passageLen, dt, elapsed),
      );
      cpusRef.current = nextCpus;
      setCpus(nextCpus);

      const t = typingRef.current;
      if (t?.startedAtMs != null) {
        setLiveWpm(computeWpm(t.correctIndex, t.startedAtMs, now));
        setLiveAccuracy(computeAccuracy(t.correctIndex, t.attempts));
      }

      if (t?.finishedAtMs != null) {
        finishRace(t, nextCpus);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [finishRace]);

  const beginCountdown = useCallback(() => {
    const pool = passages.length > 0 ? passages : undefined;
    const picked = pickPassage(difficulty as PassageDifficulty, pool);
    const state = createTypingState(picked.text);
    const bots = createCpuRacers(difficulty, cpuCount);

    setPassage(picked);
    setTyping(state);
    typingRef.current = state;
    setCpus(bots);
    cpusRef.current = bots;
    setSubmitted(null);
    setResults([]);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setPhase("countdown");

    const steps: Array<number | "GO"> = [3, 2, 1, "GO"];
    let i = 0;
    setCountdown(steps[0]!);

    const id = window.setInterval(() => {
      i += 1;
      if (i >= steps.length) {
        window.clearInterval(id);
        setCountdown(null);
        setPhase("racing");
        startLoop();
        return;
      }
      setCountdown(steps[i]!);
    }, 700);
  }, [passages, difficulty, cpuCount, startLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onChar = useCallback(
    (char: string) => {
      if (phase !== "racing" || !typingRef.current) return;
      const next = applyKey(typingRef.current, char, performance.now());
      typingRef.current = next;
      setTyping(next);
    },
    [phase],
  );

  const onBackspace = useCallback(() => {
    if (phase !== "racing" || !typingRef.current) return;
    const next = applyBackspace(typingRef.current);
    typingRef.current = next;
    setTyping(next);
  }, [phase]);

  const resetToSetup = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPhase("setup");
    setPassage(null);
    setTyping(null);
    setCpus([]);
    setCountdown(null);
    setResults([]);
    setSubmitted(null);
  };

  if (phase === "setup") {
    return (
      <main className="asphalt-grain flex min-h-dvh flex-col px-5 py-10 sm:px-8">
        <Link href="/play" className="font-logo text-2xl text-chalk sm:text-3xl">
          Clack<span className="text-cyan">Race</span>
        </Link>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-16">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            Race CPU
          </p>
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
                    onClick={() => setDifficulty(d)}
                    className={`rounded-sm border px-3 py-4 font-heading text-sm font-semibold uppercase tracking-wider ${
                      difficulty === d
                        ? "border-cyan bg-cyan/10 text-cyan"
                        : "border-lane text-chalk hover:border-chalk/40"
                    }`}
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
                onChange={(e) => setCpuCount(Number(e.target.value))}
                className="mt-4 w-full accent-cyan"
              />
            </div>

            <button
              type="button"
              onClick={beginCountdown}
              className="w-full rounded-sm bg-cyan px-6 py-4 font-heading text-sm font-bold uppercase tracking-wider text-asphalt transition-transform hover:scale-[1.01] sm:w-auto sm:min-w-[220px]"
            >
              Start race
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "results") {
    return (
      <main className="asphalt-grain flex min-h-dvh flex-col px-5 py-10 sm:px-8">
        <Link href="/" className="font-logo text-2xl text-chalk sm:text-3xl">
          Clack<span className="text-cyan">Race</span>
        </Link>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12">
          <ResultScreen
            results={results}
            submitted={submitted}
            onPlayAgain={resetToSetup}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="asphalt-grain relative flex min-h-dvh flex-col px-5 py-6 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/play" className="font-logo text-xl text-chalk sm:text-2xl">
          Clack<span className="text-cyan">Race</span>
        </Link>
        <div className="flex gap-4 font-mono text-sm">
          <span className="text-cyan">{Math.round(liveWpm)} WPM</span>
          <span className="text-chalk-muted">{Math.round(liveAccuracy)}%</span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-4xl flex-1">
        <CountdownOverlay value={countdown} />
        <RaceTrack racers={trackRacers} />
        <div className="mt-6">
          {typing ? (
            <TypingPanel
              passage={typing.passage}
              typed={typing.typed}
              enabled={phase === "racing"}
              onChar={onChar}
              onBackspace={onBackspace}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
