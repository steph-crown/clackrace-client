"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pickSuggestedName } from "@/lib/anonymous-names";
import { fetchSession } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session-token";
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
import { raceAudio } from "@/lib/audio/manager";
import { resultsAudioCue } from "@/lib/race/placement";
import type { TrackRacer } from "./RaceTrack";
import { ConnectingState } from "./multiplayer/ConnectingState";
import { JoinErrorState } from "./multiplayer/JoinErrorState";
import { LiveRaceScreen } from "./multiplayer/LiveRaceScreen";
import { LobbyScreen } from "./multiplayer/LobbyScreen";
import { SessionEndedState } from "./multiplayer/SessionEndedState";
import type {
  MultiplayerPhase,
  MultiplayerRaceResult,
  SessionLeaderboardEntry,
  SessionMember,
} from "./multiplayer/types";
import { WaitingForRace } from "./multiplayer/WaitingForRace";

type Props = { sessionId: string };

const POSITION_THROTTLE_MS = 150;

export function MultiplayerRaceApp({ sessionId }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<MultiplayerPhase>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [members, setMembers] = useState<SessionMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<SessionLeaderboardEntry[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("You");
  const [isCreator, setIsCreator] = useState(false);
  const [countdown, setCountdown] = useState<number | "GO" | null>(null);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [results, setResults] = useState<MultiplayerRaceResult[]>([]);
  const [localFinished, setLocalFinished] = useState(false);
  const [visibility, setVisibility] = useState<
    "public" | "challenge" | "matchmade"
  >("public");
  const [rematch, setRematch] = useState<{
    requestedByMemberId: string;
  } | null>(null);
  const [commit, setCommit] = useState<{
    endsAt: number;
    promptedByName: string;
    promptedByMemberId?: string;
    readyMemberIds: string[];
  } | null>(null);
  const [youReady, setYouReady] = useState(false);
  const [, setCommitTick] = useState(0);

  const targetProgress = useRef<Record<string, number>>({});
  const displayProgress = useRef<Record<string, number>>({});
  const [renderedProgress, setRenderedProgress] = useState<Record<string, number>>({});
  const typingRef = useRef<TypingState | null>(null);
  const memberIdRef = useRef<string | null>(null);
  const lastPosSent = useRef(0);
  const rafRef = useRef<number | null>(null);
  const finishedSent = useRef(false);

  useEffect(() => {
    memberIdRef.current = memberId;
  }, [memberId]);
  useEffect(() => {
    typingRef.current = typing;
  }, [typing]);
  useEffect(() => {
    if (!commit) return;
    const id = window.setInterval(() => setCommitTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [commit]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  // PRD §6.5 — surface common tab-close cases quickly; server remains authoritative
  useEffect(() => {
    const onUnload = () => {
      const s = getSocket();
      if (s.connected) s.disconnect();
    };
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []);

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
      const sessionToken = await getSessionToken();
      if (!socket.connected) socket.connect();
      void raceAudio.ensureUnlocked();

      socket.emit(
        "session:join",
        {
          sessionId,
          guestSessionToken: token,
          suggestedName: suggested,
          sessionToken,
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
            members: SessionMember[];
            leaderboard: SessionLeaderboardEntry[];
            visibility?: "public" | "challenge" | "matchmade";
            commit?: {
              endsAt: number;
              promptedByName: string;
              readyMemberIds: string[];
            } | null;
            you?: { ready?: boolean };
            rematch?: { requestedByMemberId: string } | null;
          };
        }) => {
          if (cancelled) return;
          if (!res?.ok) {
            setPhase("error");
            const code = res?.code;
            setError(
              code === "full"
                ? "This race is full."
                : code === "auth_required"
                  ? "Sign in to join this challenge."
                  : code === "forbidden"
                    ? "This challenge is private."
                    : (res?.message ?? "Could not join."),
            );
            return;
          }
          setMemberId(res.memberId!);
          setDisplayName(res.displayName!);
          setIsCreator(!!res.isCreator);
          if (res.snapshot) {
            setMembers(res.snapshot.members);
            setLeaderboard(res.snapshot.leaderboard);
            if (res.snapshot.visibility) {
              setVisibility(res.snapshot.visibility);
            }
            setRematch(res.snapshot.rematch ?? null);
            setCommit(res.snapshot.commit ?? null);
            setYouReady(!!res.snapshot.you?.ready);
          }
          setPhase(res.pending ? "waiting_race" : "lobby");
        },
      );
    }

    const onState = (snap: {
      members: SessionMember[];
      leaderboard: SessionLeaderboardEntry[];
      status: string;
      visibility?: "public" | "challenge" | "matchmade";
      commit?: {
        endsAt: number;
        promptedByName: string;
        readyMemberIds: string[];
      } | null;
      rematch?: { requestedByMemberId: string } | null;
      you: {
        pending: boolean;
        isCreator: boolean;
        displayName: string;
        ready?: boolean;
      } | null;
    }) => {
      setMembers(snap.members);
      setLeaderboard(snap.leaderboard);
      if (snap.visibility) setVisibility(snap.visibility);
      setRematch(snap.rematch ?? null);
      setCommit(snap.commit ?? null);
      if (snap.you) {
        setIsCreator(snap.you.isCreator);
        setDisplayName(snap.you.displayName);
        setYouReady(!!snap.you.ready);
      }
      setPhase((p) => {
        if (snap.status === "ended") return "ended";
        if (p === "waiting_race" && snap.status === "waiting") return "lobby";
        // Keep results screen after race; session goes back to waiting for refill.
        // Only leave racing → lobby if we never got results (abort / disconnect).
        if (snap.status === "waiting" && p === "racing") return "lobby";
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
        raceAudio.play("go");
        window.setTimeout(() => setCountdown(null), 400);
      } else {
        raceAudio.play("countdown");
      }
    };
    const onRaceStart = (p: { passageText: string }) => {
      finishedSent.current = false;
      setLocalFinished(false);
      setRematch(null);
      const state = createTypingState(p.passageText);
      typingRef.current = state;
      setTyping(state);
      targetProgress.current = {};
      displayProgress.current = {};
      setRenderedProgress({});
      setLiveWpm(0);
      setLiveAccuracy(100);
      setResults([]);
      setPhase("racing");
      setCountdown(null);
      raceAudio.play("raceBed");
    };
    const onPositions = (p: {
      positions: Record<string, { progress: number }>;
    }) => {
      for (const [id, pos] of Object.entries(p.positions)) {
        targetProgress.current[id] = pos.progress;
        if (displayProgress.current[id] == null) {
          displayProgress.current[id] = pos.progress;
        }
      }
    };
    const onResults = (p: {
      results: MultiplayerRaceResult[];
      leaderboard: SessionLeaderboardEntry[];
    }) => {
      setResults(p.results);
      setLeaderboard(p.leaderboard);
      setPhase("results");
      setTyping(null);
      typingRef.current = null;
      raceAudio.stopRaceBed();
      raceAudio.play("finish");
      const me = memberIdRef.current;
      const you = p.results.find((r) => r.memberId === me && r.finished);
      if (you) {
        const cue = resultsAudioCue(you.placement);
        raceAudio.play(
          cue === "win"
            ? "resultsWin"
            : cue === "podium"
              ? "resultsPodium"
              : "resultsFinish",
        );
      }
    };

    socket.on("session:state", onState);
    socket.on("session:toast", onToast);
    socket.on("session:error", onError);
    socket.on("race:countdown", onCountdown);
    socket.on("race:start", onRaceStart);
    socket.on("race:positions", onPositions);
    socket.on("race:results", onResults);
    socket.on("session:ended", () => setPhase("ended"));
    socket.on(
      "matchmaking:requeued",
      (p: {
        ticketId: string;
        status: string;
        sessionId: string | null;
        expiresAt: number;
      }) => {
        if (p.sessionId) {
          router.replace(`/play/${p.sessionId}`);
          return;
        }
        router.replace("/play/quick");
      },
    );
    socket.on("matchmaking:alone", (p: { message?: string }) => {
      showToast(p.message ?? "Still alone — try other modes.");
      router.replace("/play/quick");
    });

    void join();

    return () => {
      cancelled = true;
      raceAudio.stopRaceBed();
      // SPA navigations don't fire pagehide — free the seat on unmount.
      if (socket.connected) {
        socket.emit("session:leave");
      }
      socket.off("session:state", onState);
      socket.off("session:toast", onToast);
      socket.off("session:error", onError);
      socket.off("race:countdown", onCountdown);
      socket.off("race:start", onRaceStart);
      socket.off("race:positions", onPositions);
      socket.off("race:results", onResults);
      socket.off("session:ended");
      socket.off("matchmaking:requeued");
      socket.off("matchmaking:alone");
    };
  }, [sessionId, showToast, router]);

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
          const wpm = computeWpm(
            t.correctIndex,
            t.startedAtMs,
            performance.now(),
          );
          setLiveWpm(wpm);
          raceAudio.setDrivingFromWpm(wpm);
          setLiveAccuracy(computeAccuracy(t.correctIndex, t.attempts));
        }
      }

      if (changed || t) {
        setRenderedProgress({ ...displayProgress.current });
      }
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
    setLocalFinished(true);
    const durationMs =
      state.startedAtMs != null
        ? state.finishedAtMs - state.startedAtMs
        : 0;
    getSocket().emit(
      "race:finish",
      {
        mistakes: state.mistakes,
        keystrokes: state.keystrokes,
        durationMs: Math.round(durationMs),
        mistypeCounts: state.mistypeCounts,
      },
      (res: { ok?: boolean } | undefined) => {
        if (!res?.ok) finishedSent.current = false;
      },
    );
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
    return members
      .filter((m) => !m.disconnected && !m.pending)
      .map((m) => {
        const isYou = m.id === memberId;
        return {
          id: m.id,
          label: isYou ? "You" : m.displayName.replace("Anonymous ", ""),
          progress: isYou
            ? typing
              ? progressOf(typing)
              : 0
            : (renderedProgress[m.id] ?? 0),
          bodyColor: m.carColor,
          accentColor: "#e8e6e1",
          isYou,
        };
      });
  }, [members, memberId, typing, renderedProgress]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${sessionId}`
      : `/play/${sessionId}`;

  if (phase === "connecting") return <ConnectingState />;
  if (phase === "error")
    return <JoinErrorState message={error ?? "Could not join."} />;
  if (phase === "ended") return <SessionEndedState />;
  if (phase === "waiting_race")
    return <WaitingForRace sessionId={sessionId} toast={toast} />;

  if (phase === "lobby" || phase === "results") {
    return (
      <LobbyScreen
        sessionId={sessionId}
        displayName={displayName}
        isCreator={isCreator}
        phase={phase}
        members={members}
        memberId={memberId}
        leaderboard={leaderboard}
        results={results}
        shareUrl={shareUrl}
        toast={toast}
        visibility={visibility}
        rematch={rematch}
        commit={commit}
        youReady={youReady}
        onStartRace={() => getSocket().emit("race:start")}
        onReady={() => getSocket().emit("session:ready")}
        onPlayAgain={() => getSocket().emit("session:playAgain")}
        onRematchRespond={(accept) =>
          getSocket().emit("session:rematchRespond", { accept })
        }
        onEndSession={() => getSocket().emit("session:end")}
        onLeave={() =>
          getSocket().emit("session:leave", () => router.push("/play"))
        }
      />
    );
  }

  const chromeMode =
    visibility === "matchmade"
      ? "quick"
      : visibility === "challenge"
        ? "challenge"
        : "public";

  return (
    <LiveRaceScreen
      toast={toast}
      countdown={countdown}
      racers={trackRacers}
      wpm={liveWpm}
      accuracy={liveAccuracy}
      localFinished={localFinished}
      passage={typing?.passage ?? null}
      typed={typing?.typed ?? ""}
      typingEnabled={phase === "racing"}
      currentMode={chromeMode}
      onChar={onChar}
      onBackspace={onBackspace}
    />
  );
}
