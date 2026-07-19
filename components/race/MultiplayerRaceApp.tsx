"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pickSuggestedName } from "@/lib/anonymous-names";
import { fetchSession } from "@/lib/api/client";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";
import { getSocket } from "@/lib/socket";
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
import { TypingPanel } from "./TypingPanel";

type Phase =
  | "connecting"
  | "lobby"
  | "waiting_race"
  | "countdown"
  | "racing"
  | "results"
  | "ended"
  | "error";

type Member = {
  id: string;
  displayName: string;
  carColor: string;
  isCreator: boolean;
  pending: boolean;
  disconnected: boolean;
};

type LeaderboardEntry = {
  memberId: string;
  displayName: string;
  bestWpm: number;
  racesPlayed: number;
};

type RaceResult = {
  memberId: string;
  displayName: string;
  carColor: string;
  wpm: number;
  accuracy: number;
  finished: boolean;
  placement: number;
  disconnected: boolean;
};

type Props = { sessionId: string };

const POSITION_THROTTLE_MS = 150;

export function MultiplayerRaceApp({ sessionId }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("You");
  const [isCreator, setIsCreator] = useState(false);
  const [pending, setPending] = useState(false);
  const [countdown, setCountdown] = useState<number | "GO" | null>(null);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [copied, setCopied] = useState(false);

  // Opponent progress: server target + interpolated display
  const targetProgress = useRef<Record<string, number>>({});
  const displayProgress = useRef<Record<string, number>>({});
  const [progressTick, setProgressTick] = useState(0);

  const typingRef = useRef<TypingState | null>(null);
  const memberIdRef = useRef<string | null>(null);
  const lastPosSent = useRef(0);
  const raceStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const finishedSent = useRef(false);

  useEffect(() => {
    memberIdRef.current = memberId;
  }, [memberId]);
  useEffect(() => {
    typingRef.current = typing;
  }, [typing]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  // Join socket
  useEffect(() => {
    let cancelled = false;
    const socket = getSocket();

    async function join() {
      const info = await fetchSession(sessionId);
      if (cancelled) return;
      if (!info) {
        setPhase("error");
        setError("This race session was not found.");
        return;
      }

      const token = getOrCreateGuestSessionToken();
      const suggested = pickSuggestedName(info.takenNames);

      if (!socket.connected) socket.connect();

      socket.emit(
        "session:join",
        {
          sessionId,
          guestSessionToken: token,
          suggestedName: suggested,
          carColor: "#2ee6d6",
        },
        (res: {
          ok: boolean;
          code?: string;
          message?: string;
          memberId?: string;
          displayName?: string;
          isCreator?: boolean;
          pending?: boolean;
          snapshot?: {
            members: Member[];
            leaderboard: LeaderboardEntry[];
            status: string;
          };
        }) => {
          if (cancelled) return;
          if (!res?.ok) {
            setPhase("error");
            setError(
              res?.code === "full"
                ? "This race is full."
                : res?.message ?? "Could not join.",
            );
            return;
          }
          setMemberId(res.memberId!);
          setDisplayName(res.displayName!);
          setIsCreator(!!res.isCreator);
          setPending(!!res.pending);
          if (res.snapshot) {
            setMembers(res.snapshot.members);
            setLeaderboard(res.snapshot.leaderboard);
          }
          setPhase(res.pending ? "waiting_race" : "lobby");
        },
      );
    }

    const onState = (snap: {
      members: Member[];
      leaderboard: LeaderboardEntry[];
      status: string;
      you: { pending: boolean; isCreator: boolean; displayName: string } | null;
    }) => {
      setMembers(snap.members);
      setLeaderboard(snap.leaderboard);
      if (snap.you) {
        setPending(snap.you.pending);
        setIsCreator(snap.you.isCreator);
        setDisplayName(snap.you.displayName);
      }
      setPhase((p) => {
        if (snap.status === "ended") return "ended";
        if (p === "waiting_race" && snap.status === "waiting") return "lobby";
        return p;
      });
    };

    const onToast = (p: { message: string }) => showToast(p.message);
    const onError = (p: { message: string }) => {
      setPhase("error");
      setError(p.message);
    };
    const onCountdown = (p: { value: number | "GO" }) => {
      setPhase("countdown");
      setCountdown(p.value);
      if (p.value === "GO") {
        window.setTimeout(() => setCountdown(null), 400);
      }
    };
    const onRaceStart = (p: {
      passageText: string;
      startedAtMs: number;
    }) => {
      finishedSent.current = false;
      const state = createTypingState(p.passageText);
      typingRef.current = state;
      setTyping(state);
      raceStartRef.current = performance.now();
      targetProgress.current = {};
      displayProgress.current = {};
      setLiveWpm(0);
      setLiveAccuracy(100);
      setResults([]);
      setPhase("racing");
      setPending(false);
      setCountdown(null);
    };
    const onPositions = (p: {
      positions: Record<
        string,
        { progress: number; finished: boolean; disconnected: boolean }
      >;
    }) => {
      for (const [id, pos] of Object.entries(p.positions)) {
        targetProgress.current[id] = pos.progress;
        if (displayProgress.current[id] == null) {
          displayProgress.current[id] = pos.progress;
        }
      }
    };
    const onResults = (p: {
      results: RaceResult[];
      leaderboard: LeaderboardEntry[];
    }) => {
      setResults(p.results);
      setLeaderboard(p.leaderboard);
      setPhase("results");
      setTyping(null);
      typingRef.current = null;
    };
    const onEnded = () => setPhase("ended");

    socket.on("session:state", onState);
    socket.on("session:toast", onToast);
    socket.on("session:error", onError);
    socket.on("race:countdown", onCountdown);
    socket.on("race:start", onRaceStart);
    socket.on("race:positions", onPositions);
    socket.on("race:results", onResults);
    socket.on("session:ended", onEnded);

    void join();

    return () => {
      cancelled = true;
      socket.off("session:state", onState);
      socket.off("session:toast", onToast);
      socket.off("session:error", onError);
      socket.off("race:countdown", onCountdown);
      socket.off("race:start", onRaceStart);
      socket.off("race:positions", onPositions);
      socket.off("race:results", onResults);
      socket.off("session:ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join once per session
  }, [sessionId, showToast]);

  // Interpolate opponent cars + live WPM
  useEffect(() => {
    if (phase !== "racing") return;

    const loop = () => {
      let changed = false;
      for (const [id, target] of Object.entries(targetProgress.current)) {
        const cur = displayProgress.current[id] ?? 0;
        const next = cur + (target - cur) * 0.18;
        if (Math.abs(next - cur) > 0.0005) {
          displayProgress.current[id] = next;
          changed = true;
        } else {
          displayProgress.current[id] = target;
        }
      }

      const t = typingRef.current;
      const me = memberIdRef.current;
      if (t && me) {
        displayProgress.current[me] = progressOf(t);
        if (t.startedAtMs != null) {
          setLiveWpm(computeWpm(t.correctIndex, t.startedAtMs, performance.now()));
          setLiveAccuracy(computeAccuracy(t.correctIndex, t.attempts));
        }
      }

      if (changed || t) setProgressTick((n) => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  const sendPosition = useCallback((correctIndex: number) => {
    const now = performance.now();
    if (now - lastPosSent.current < POSITION_THROTTLE_MS) return;
    lastPosSent.current = now;
    getSocket().emit("race:position", { correctIndex });
  }, []);

  const finishIfNeeded = useCallback((state: TypingState) => {
    if (state.finishedAtMs == null || finishedSent.current) return;
    finishedSent.current = true;
    const durationMs =
      state.startedAtMs != null
        ? state.finishedAtMs - state.startedAtMs
        : 0;
    getSocket().emit("race:finish", {
      mistakes: state.mistakes,
      keystrokes: state.keystrokes,
      durationMs: Math.round(durationMs),
    });
  }, []);

  const onChar = useCallback(
    (char: string) => {
      if (phase !== "racing" || !typingRef.current) return;
      const next = applyKey(typingRef.current, char, performance.now());
      typingRef.current = next;
      setTyping(next);
      sendPosition(next.correctIndex);
      finishIfNeeded(next);
    },
    [phase, sendPosition, finishIfNeeded],
  );

  const onBackspace = useCallback(() => {
    if (phase !== "racing" || !typingRef.current) return;
    const next = applyBackspace(typingRef.current);
    typingRef.current = next;
    setTyping(next);
    sendPosition(next.correctIndex);
  }, [phase, sendPosition]);

  const trackRacers: TrackRacer[] = useMemo(() => {
    const active = members.filter((m) => !m.disconnected && !m.pending);
    return active.map((m) => {
      const isYou = m.id === memberId;
      const progress = isYou
        ? typing
          ? progressOf(typing)
          : 0
        : (displayProgress.current[m.id] ?? 0);
      return {
        id: m.id,
        label: isYou ? "You" : m.displayName.replace("Anonymous ", ""),
        progress,
        bodyColor: m.carColor,
        accentColor: "#e8e6e1",
        isYou,
      };
    });
    // progressTick forces re-render for interpolation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, memberId, typing, phase, progressTick]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${sessionId}`
      : `/play/${sessionId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Could not copy link");
    }
  };

  const startRace = () => getSocket().emit("race:start");
  const playAgain = () => getSocket().emit("session:playAgain");
  const endSession = () => getSocket().emit("session:end");
  const leave = () => {
    getSocket().emit("session:leave", () => {
      router.push("/play");
    });
  };

  if (phase === "connecting") {
    return (
      <Shell>
        <p className="text-chalk-muted">Joining race session…</p>
      </Shell>
    );
  }

  if (phase === "error") {
    return (
      <Shell>
        <h1 className="font-heading text-3xl font-bold uppercase text-chalk">
          Can&apos;t join
        </h1>
        <p className="mt-3 text-chalk-muted">{error}</p>
        <Link
          href="/play"
          className="mt-8 inline-block rounded-sm border border-lane px-5 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-chalk"
        >
          ← Modes
        </Link>
      </Shell>
    );
  }

  if (phase === "ended") {
    return (
      <Shell>
        <h1 className="font-heading text-3xl font-bold uppercase text-chalk">
          Session ended
        </h1>
        <Link
          href="/play"
          className="mt-8 inline-block rounded-sm bg-cyan px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-asphalt"
        >
          Back to modes
        </Link>
      </Shell>
    );
  }

  if (phase === "waiting_race") {
    return (
      <Shell toast={toast}>
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Race Code: {sessionId}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk">
          Hang tight
        </h1>
        <p className="mt-3 text-chalk-muted">
          A race is in progress — you&apos;ll be added when it ends.
        </p>
        <div className="mt-10 h-1 w-40 animate-pulse bg-cyan/40" />
      </Shell>
    );
  }

  if (phase === "lobby" || phase === "results") {
    const youResult = results.find((r) => r.memberId === memberId);
    return (
      <Shell toast={toast}>
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Race Code: {sessionId}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk sm:text-4xl">
          {phase === "results" ? "Race complete" : "Lobby"}
        </h1>
        <p className="mt-2 text-sm text-chalk-muted">
          Racing as {displayName} — you always see yourself as{" "}
          <span className="text-cyan">You</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-sm border border-lane px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-chalk hover:border-cyan/50"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          {phase === "lobby" && !isCreator ? (
            <button
              type="button"
              onClick={leave}
              className="rounded-sm border border-lane px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-chalk-muted hover:border-chalk/40"
            >
              Leave
            </button>
          ) : null}
        </div>

        {phase === "results" && youResult ? (
          <dl className="mt-8 grid grid-cols-3 gap-4">
            <Stat label="Place" value={`#${youResult.placement}`} />
            <Stat label="WPM" value={String(Math.round(youResult.wpm))} accent />
            <Stat
              label="Accuracy"
              value={`${Math.round(youResult.accuracy)}%`}
            />
          </dl>
        ) : null}

        <section className="mt-10">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
            Racers ({members.filter((m) => !m.disconnected).length}/8)
          </h2>
          <ul className="mt-3 space-y-2">
            {members
              .filter((m) => !m.disconnected)
              .map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-sm border border-lane bg-asphalt-raised px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: m.carColor }}
                    />
                    <span className="font-heading text-sm font-semibold uppercase tracking-wide text-chalk">
                      {m.id === memberId ? "You" : m.displayName}
                      {m.isCreator ? " · Host" : ""}
                      {m.pending ? " · Waiting" : ""}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </section>

        {leaderboard.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
              Session leaderboard
            </h2>
            <ol className="mt-3 space-y-2">
              {leaderboard.map((e, i) => (
                <li
                  key={e.memberId}
                  className="flex justify-between rounded-sm border border-lane/60 px-4 py-2 font-mono text-sm"
                >
                  <span className="text-chalk">
                    #{i + 1}{" "}
                    {e.memberId === memberId ? "You" : e.displayName}
                  </span>
                  <span className="text-cyan">{Math.round(e.bestWpm)} WPM</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {isCreator ? (
          <div className="mt-10 flex flex-wrap gap-3">
            {phase === "lobby" ? (
              <button
                type="button"
                onClick={startRace}
                className="rounded-sm bg-cyan px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-asphalt"
              >
                Start race
              </button>
            ) : (
              <button
                type="button"
                onClick={playAgain}
                className="rounded-sm bg-cyan px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-asphalt"
              >
                Play again
              </button>
            )}
            <button
              type="button"
              onClick={endSession}
              className="rounded-sm border border-lane px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-chalk-muted"
            >
              End session
            </button>
          </div>
        ) : phase === "lobby" ? (
          <p className="mt-10 text-sm text-chalk-muted">
            Waiting for the host to start…
          </p>
        ) : (
          <p className="mt-10 text-sm text-chalk-muted">
            Waiting for the host to rematch…
          </p>
        )}
      </Shell>
    );
  }

  // countdown + racing
  return (
    <main className="asphalt-grain relative flex min-h-dvh flex-col px-5 py-6 sm:px-8">
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-sm border border-lane bg-asphalt-raised px-4 py-2 text-sm text-chalk shadow-lg">
          {toast}
        </div>
      ) : null}
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
          ) : (
            <p className="text-center text-sm text-chalk-muted">
              Get ready…
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Shell({
  children,
  toast,
}: {
  children: React.ReactNode;
  toast?: string | null;
}) {
  return (
    <main className="asphalt-grain flex min-h-dvh flex-col px-5 py-10 sm:px-8">
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-sm border border-lane bg-asphalt-raised px-4 py-2 text-sm text-chalk shadow-lg">
          {toast}
        </div>
      ) : null}
      <Link href="/play" className="font-logo text-2xl text-chalk sm:text-3xl">
        Clack<span className="text-cyan">Race</span>
      </Link>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12">
        {children}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
        {label}
      </dt>
      <dd
        className={`font-heading text-3xl font-bold ${accent ? "text-cyan" : "text-chalk"}`}
      >
        {value}
      </dd>
    </div>
  );
}
