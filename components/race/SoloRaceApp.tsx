"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchGhost, fetchMe } from "@/lib/api/clack";
import { fetchPassages, submitSoloResult } from "@/lib/api/client";
import { ghostProgressAt } from "@/lib/race/ghost";
import { useSession } from "@/lib/auth/client";
import type { KeystrokeEntry } from "@/lib/typing/engine";
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
import { raceAudio } from "@/lib/audio/manager";
import { resultsAudioCue } from "@/lib/race/placement";
import { PageShell } from "@/components/ui/PageShell";
import { ResultScreen } from "./ResultScreen";
import type { TrackRacer } from "./RaceTrack";
import { SoloLiveRace } from "./solo/SoloLiveRace";
import { SoloSetup } from "./solo/SoloSetup";

type Phase = "setup" | "countdown" | "racing" | "results";

type SoloRaceAppProps = {
  /** From `/play/solo?beat=1` — jump straight into Beat your best. */
  autoBeat?: boolean;
};

export function SoloRaceApp({ autoBeat = false }: SoloRaceAppProps) {
  const { data: authSession } = useSession();
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<CpuDifficulty>("medium");
  const [cpuCount, setCpuCount] = useState(3);
  const [playerCarColor, setPlayerCarColor] = useState("#2ee6d6");
  const [passages, setPassages] = useState<Passage[]>([]);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [cpus, setCpus] = useState<CpuRacer[]>([]);
  const [countdown, setCountdown] = useState<number | "GO" | null>(null);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [results, setResults] = useState<RacerResult[]>([]);
  const [submitted, setSubmitted] = useState<boolean | null>(null);
  const [ghostMode, setGhostMode] = useState(false);
  const [ghostProgress, setGhostProgress] = useState(0);
  const [ghostAvailable, setGhostAvailable] = useState(false);
  const [ghostBusy, setGhostBusy] = useState(false);

  const cpusRef = useRef<CpuRacer[]>([]);
  const typingRef = useRef<TypingState | null>(null);
  const raceStartPerfRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const countdownIdRef = useRef<number | null>(null);
  const ghostStrokesRef = useRef<KeystrokeEntry[]>([]);
  const ghostMetaRef = useRef<{ wpm: number; accuracy: number } | null>(null);
  const ghostModeRef = useRef(false);
  const autoBeatStartedRef = useRef(false);

  useEffect(() => {
    void fetchPassages().then(setPassages);
    void fetchMe().then((res) => {
      if (res.ok) setPlayerCarColor(res.data.user.carColor);
    });
  }, []);

  useEffect(() => {
    ghostModeRef.current = ghostMode;
  }, [ghostMode]);

  useEffect(() => {
    if (!authSession?.user) {
      setGhostAvailable(false);
      return;
    }
    void fetchGhost().then((res) => setGhostAvailable(res.ok));
  }, [authSession?.user]);

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
      bodyColor: playerCarColor,
      accentColor: "#e8e6e1",
      isYou: true,
    };
    if (ghostMode) {
      return [
        player,
        {
          id: "ghost",
          label: "Your best",
          progress: ghostProgress,
          bodyColor: "#6b7280",
          accentColor: "#e8e6e1",
        },
      ];
    }
    const bots: TrackRacer[] = cpus.map((c) => ({
      id: c.id,
      label: c.name.replace("CPU ", ""),
      progress: passage ? c.correctIndex / passage.text.length : 0,
      bodyColor: c.bodyColor,
      accentColor: c.accentColor,
    }));
    return [player, ...bots];
  }, [typing, cpus, passage, playerCarColor, ghostMode, ghostProgress]);

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

      let ghostInput = null;
      if (ghostModeRef.current && ghostMetaRef.current) {
        const passageLen = finalTyping.passage.length;
        const strokes = ghostStrokesRef.current;
        const progress = ghostProgressAt(strokes, passageLen, elapsed);
        const last = strokes[strokes.length - 1];
        const ghostFinished =
          last != null && last.timestampMs <= elapsed && progress >= 1;
        ghostInput = {
          finishElapsedMs: ghostFinished ? last.timestampMs : null,
          progress,
          wpm: ghostMetaRef.current.wpm,
          accuracy: ghostMetaRef.current.accuracy,
        };
      }

      const ranked = buildSoloResults(
        finalTyping,
        finalCpus,
        elapsed,
        playerFinishElapsed,
        ghostInput,
      );
      setResults(ranked);
      setPhase("results");
      raceAudio.stopRaceBed();
      raceAudio.play("finish");
      const youForAudio = ranked.find((r) => r.isYou);
      if (youForAudio) {
        const cue = resultsAudioCue(youForAudio.placement);
        raceAudio.play(
          cue === "win"
            ? "resultsWin"
            : cue === "podium"
              ? "resultsPodium"
              : "resultsFinish",
        );
      }

      const you = ranked.find((r) => r.isYou);
      if (!you || !passage) return;

      const durationMs =
        finalTyping.finishedAtMs != null && finalTyping.startedAtMs != null
          ? finalTyping.finishedAtMs - finalTyping.startedAtMs
          : elapsed;

      void submitSoloResult({
        passageId: passage.id,
        guestSessionToken: getOrCreateGuestSessionToken(),
        carColor: playerCarColor,
        finalWpm: you.wpm,
        finalAccuracy: you.accuracy,
        placement: you.placement,
        participantCount: ranked.length,
        cpuDifficulty: difficulty,
        cpuCount: finalCpus.length,
        mode: ghostModeRef.current ? "solo_ghost" : "solo_cpu",
        durationMs: Math.round(durationMs),
        mistakes: finalTyping.mistakes,
        mistypeCounts: finalTyping.mistypeCounts,
        keystrokes: finalTyping.keystrokes,
        passageLength: passage.text.length,
      }).then((res) => setSubmitted(res.ok));
    },
    [passage, difficulty, playerCarColor],
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

      let nextCpus = cpusRef.current;
      if (!ghostModeRef.current) {
        nextCpus = cpusRef.current.map((c) =>
          tickCpu(c, passageLen, dt, elapsed),
        );
        cpusRef.current = nextCpus;
        setCpus(nextCpus);
      } else {
        setGhostProgress(
          ghostProgressAt(ghostStrokesRef.current, passageLen, elapsed),
        );
      }

      const t = typingRef.current;
      if (t?.startedAtMs != null) {
        const wpm = computeWpm(t.correctIndex, t.startedAtMs, now);
        setLiveWpm(wpm);
        raceAudio.setDrivingFromWpm(wpm);
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
    setGhostMode(false);
    ghostModeRef.current = false;
    ghostStrokesRef.current = [];
    ghostMetaRef.current = null;
    setGhostProgress(0);

    const pool = passages.length > 0 ? passages : undefined;
    const passageDifficulty: PassageDifficulty =
      difficulty === "expert" ? "hard" : difficulty;
    const picked = pickPassage(passageDifficulty, pool);
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

    if (countdownIdRef.current != null) {
      window.clearInterval(countdownIdRef.current);
      countdownIdRef.current = null;
    }

    const steps: Array<number | "GO"> = [3, 2, 1, "GO"];
    let i = 0;
    setCountdown(steps[0]!);
    raceAudio.play("countdown");

    countdownIdRef.current = window.setInterval(() => {
      i += 1;
      if (i >= steps.length) {
        if (countdownIdRef.current != null) {
          window.clearInterval(countdownIdRef.current);
          countdownIdRef.current = null;
        }
        setCountdown(null);
        setPhase("racing");
        raceAudio.play("raceBed");
        startLoop();
        return;
      }
      const step = steps[i]!;
      setCountdown(step);
      if (step === "GO") raceAudio.play("go");
      else raceAudio.play("countdown");
    }, 700);
  }, [passages, difficulty, cpuCount, startLoop]);

  const beginGhostCountdown = useCallback(async () => {
    setGhostBusy(true);
    const res = await fetchGhost();
    setGhostBusy(false);
    if (!res.ok) {
      setGhostAvailable(false);
      return;
    }

    setGhostMode(true);
    ghostModeRef.current = true;
    ghostStrokesRef.current = res.data.strokes;
    ghostMetaRef.current = {
      wpm: res.data.bestWpm,
      accuracy: res.data.bestAccuracy,
    };
    setGhostProgress(0);

    const picked: Passage = {
      id: res.data.passageId,
      text: res.data.passageText,
      difficulty: res.data.difficulty,
      source: "official",
    };
    const state = createTypingState(picked.text);
    setPassage(picked);
    setTyping(state);
    typingRef.current = state;
    setCpus([]);
    cpusRef.current = [];
    setSubmitted(null);
    setResults([]);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setPhase("countdown");

    if (countdownIdRef.current != null) {
      window.clearInterval(countdownIdRef.current);
      countdownIdRef.current = null;
    }

    const steps: Array<number | "GO"> = [3, 2, 1, "GO"];
    let i = 0;
    setCountdown(steps[0]!);
    raceAudio.play("countdown");

    countdownIdRef.current = window.setInterval(() => {
      i += 1;
      if (i >= steps.length) {
        if (countdownIdRef.current != null) {
          window.clearInterval(countdownIdRef.current);
          countdownIdRef.current = null;
        }
        setCountdown(null);
        setPhase("racing");
        raceAudio.play("raceBed");
        startLoop();
        return;
      }
      const step = steps[i]!;
      setCountdown(step);
      if (step === "GO") raceAudio.play("go");
      else raceAudio.play("countdown");
    }, 700);
  }, [startLoop]);

  useEffect(() => {
    if (!autoBeat || autoBeatStartedRef.current) return;
    if (phase !== "setup") return;
    if (!authSession?.user || !ghostAvailable || ghostBusy) return;
    autoBeatStartedRef.current = true;
    void beginGhostCountdown();
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/play/solo");
    }
  }, [
    autoBeat,
    phase,
    authSession?.user,
    ghostAvailable,
    ghostBusy,
    beginGhostCountdown,
  ]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (countdownIdRef.current != null) {
        window.clearInterval(countdownIdRef.current);
      }
      raceAudio.stopRaceBed();
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

  const stopRaceRuntime = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (countdownIdRef.current != null) {
      window.clearInterval(countdownIdRef.current);
      countdownIdRef.current = null;
    }
    raceAudio.stopRaceBed();
  };

  const resetToSetup = () => {
    stopRaceRuntime();
    setPhase("setup");
    setPassage(null);
    setTyping(null);
    setCpus([]);
    setCountdown(null);
    setResults([]);
    setSubmitted(null);
  };

  const restartRace = () => {
    stopRaceRuntime();
    beginCountdown();
  };

  if (phase === "setup") {
    return (
      <SoloSetup
        difficulty={difficulty}
        cpuCount={cpuCount}
        onDifficultyChange={setDifficulty}
        onCpuCountChange={setCpuCount}
        onStart={beginCountdown}
        onStartGhost={
          authSession?.user ? () => void beginGhostCountdown() : undefined
        }
        ghostAvailable={ghostAvailable}
        ghostBusy={ghostBusy}
      />
    );
  }

  if (phase === "results") {
    return (
      <PageShell centered>
        <ResultScreen
          results={results}
          submitted={submitted}
          onPlayAgain={resetToSetup}
          modeLabel={ghostMode ? "Beat your best" : "Race CPU"}
        />
      </PageShell>
    );
  }

  if (!typing) return null;

  return (
    <SoloLiveRace
      countdown={countdown}
      racers={trackRacers}
      wpm={liveWpm}
      accuracy={liveAccuracy}
      passage={typing.passage}
      typed={typing.typed}
      typingEnabled={phase === "racing"}
      onChar={onChar}
      onBackspace={onBackspace}
      onRestart={restartRace}
    />
  );
}
