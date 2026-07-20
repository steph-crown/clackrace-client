"use client";

import { SignUpPrompt } from "@/components/auth/SignUpPrompt";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { StatBlock } from "@/components/ui/StatBlock";
import { Toast } from "@/components/ui/Toast";
import { InviteLinkCard } from "@/components/race/InviteLinkCard";
import { RaceChrome } from "@/components/race/RaceChrome";
import { MedalBadge } from "@/components/race/results/MedalBadge";
import { PlacementHeadline } from "@/components/race/results/PlacementHeadline";
import { placeOrdinal, podiumTier } from "@/lib/race/placement";
import { cn } from "@/lib/utils/cn";
import { ShareResultButton } from "@/components/race/results/ShareResultActions";
import { RacerList } from "./RacerList";
import { SessionLeaderboard } from "./SessionLeaderboard";
import type {
  MultiplayerRaceResult,
  SessionLeaderboardEntry,
  SessionMember,
} from "./types";

type LobbyScreenProps = {
  sessionId: string;
  displayName: string;
  isCreator: boolean;
  phase: "lobby" | "results";
  members: SessionMember[];
  memberId: string | null;
  leaderboard: SessionLeaderboardEntry[];
  results: MultiplayerRaceResult[];
  shareUrl: string;
  toast?: string | null;
  visibility?: "public" | "challenge" | "matchmade";
  rematch?: { requestedByMemberId: string } | null;
  commit?: {
    endsAt: number;
    promptedByName: string;
    readyMemberIds: string[];
  } | null;
  youReady?: boolean;
  onStartRace: () => void;
  onReady?: () => void;
  onPlayAgain: () => void;
  onRematchRespond?: (accept: boolean) => void;
  onEndSession: () => void;
  onLeave: () => void;
};

export function LobbyScreen({
  sessionId,
  displayName,
  isCreator,
  phase,
  members,
  memberId,
  leaderboard,
  results,
  shareUrl,
  toast,
  visibility = "public",
  rematch = null,
  commit = null,
  youReady = false,
  onStartRace,
  onReady,
  onPlayAgain,
  onRematchRespond,
  onEndSession,
  onLeave,
}: LobbyScreenProps) {
  const youResult = results.find((r) => r.memberId === memberId);
  const isChallenge = visibility === "challenge";
  const isQuick = visibility === "matchmade";
  const iRequestedRematch =
    !!rematch && rematch.requestedByMemberId === memberId;
  const theyRequestedRematch =
    !!rematch && rematch.requestedByMemberId !== memberId;
  const activeCount = members.filter((m) => !m.disconnected && !m.pending).length;
  const commitSeconds = commit
    ? Math.max(0, Math.ceil((commit.endsAt - Date.now()) / 1000))
    : null;

  const modeChrome = isChallenge
    ? "challenge"
    : isQuick
      ? "quick"
      : "public";

  return (
    <PageShell
      centered
      logoHref="/play"
      headerRight={<RaceChrome currentMode={modeChrome} />}
    >
      {toast ? <Toast message={toast} /> : null}
      <Eyebrow>
        {isChallenge
          ? "Direct Challenge"
          : isQuick
            ? "Quick Race"
            : "Race Code"}
        : {sessionId}
      </Eyebrow>

      {phase === "results" && youResult?.finished ? (
        <div className="mt-4">
          <PlacementHeadline placement={youResult.placement} />
        </div>
      ) : (
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk sm:text-4xl">
          {phase === "results" ? "Race complete" : "Lobby"}
        </h1>
      )}

      <p className="mt-2 text-sm text-chalk-muted">
        Racing as {displayName} — you always see yourself as{" "}
        <span className="text-cyan">You</span>
      </p>

      {!isChallenge && !isQuick ? (
        <div className="mt-8">
          <InviteLinkCard shareUrl={shareUrl} />
        </div>
      ) : null}

      {isQuick && commit ? (
        <p className="mt-6 rounded-sm border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-chalk">
          <span className="text-signal">{commit.promptedByName}</span> is ready —
          race starts in{" "}
          <span className="font-mono text-signal">{commitSeconds ?? 0}s</span>
        </p>
      ) : null}

      {(phase === "lobby") && (isQuick || !isCreator) ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onLeave}
          className="mt-4"
        >
          Leave
        </Button>
      ) : null}

      {phase === "results" && youResult ? (
        <dl className="mt-8 grid grid-cols-3 gap-4">
          <StatBlock
            label="Position"
            value={placeOrdinal(youResult.placement)}
          />
          <StatBlock
            label="WPM"
            value={String(Math.round(youResult.wpm))}
            accent="cyan"
          />
          <StatBlock
            label="Accuracy"
            value={`${Math.round(youResult.accuracy)}%`}
          />
        </dl>
      ) : null}

      {phase === "results" && results.length > 0 ? (
        <ol className="mt-8 space-y-2">
          {results.map((r) => {
            const isYou = r.memberId === memberId;
            const tier = r.finished ? podiumTier(r.placement) : null;
            return (
              <li
                key={r.memberId}
                className={cn(
                  "flex items-center justify-between rounded-sm border px-4 py-3",
                  isYou
                    ? "border-cyan/40 bg-cyan/5"
                    : "border-lane bg-asphalt-raised",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-chalk-muted">
                    {r.finished ? `#${r.placement}` : "DNF"}
                  </span>
                  <MedalBadge tier={tier} />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: r.carColor }}
                  />
                  <span className="font-heading text-sm font-semibold uppercase tracking-wide text-chalk">
                    {isYou ? "You" : r.displayName}
                  </span>
                </div>
                <span className="font-mono text-sm text-chalk">
                  {r.finished ? `${Math.round(r.wpm)} WPM` : "—"}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      {phase === "results" ? <SignUpPrompt /> : null}

      {phase !== "results" ? (
        <>
          <div className="mt-10">
            <RacerList members={members} memberId={memberId} />
          </div>
          <div className="mt-10">
            <SessionLeaderboard entries={leaderboard} memberId={memberId} />
          </div>
        </>
      ) : null}

      {isQuick ? (
        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={onReady}
            disabled={activeCount < 2 || youReady}
          >
            {phase === "results"
              ? youReady
                ? "Ready — waiting…"
                : "Race again"
              : youReady
                ? "Ready"
                : "Ready"}
          </Button>
          {phase === "results" && youResult?.finished ? (
            <ShareResultButton
              wpm={youResult.wpm}
              accuracy={youResult.accuracy}
              placement={youResult.placement}
              name="You"
              mode="Quick Race"
            />
          ) : null}
          <Button type="button" variant="ghost" onClick={onLeave}>
            Leave
          </Button>
          {activeCount < 2 ? (
            <p className="w-full text-sm text-chalk-muted">
              Waiting for at least one more racer…
            </p>
          ) : null}
        </div>
      ) : isChallenge && phase === "results" ? (
        <div className="mt-10 flex flex-wrap gap-3">
          {theyRequestedRematch ? (
            <>
              <Button
                type="button"
                onClick={() => onRematchRespond?.(true)}
              >
                Accept rematch
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onRematchRespond?.(false)}
              >
                Decline
              </Button>
            </>
          ) : iRequestedRematch ? (
            <p className="text-sm text-chalk-muted">
              Rematch requested — waiting for the other player…
            </p>
          ) : (
            <Button type="button" onClick={onPlayAgain}>
              Request rematch
            </Button>
          )}
          {youResult?.finished ? (
            <ShareResultButton
              wpm={youResult.wpm}
              accuracy={youResult.accuracy}
              placement={youResult.placement}
              name="You"
              mode="Challenge"
            />
          ) : null}
          {isCreator ? (
            <Button type="button" variant="secondary" onClick={onEndSession}>
              End session
            </Button>
          ) : null}
        </div>
      ) : isCreator ? (
        <div className="mt-10 flex flex-wrap gap-3">
          {phase === "lobby" ? (
            <Button type="button" onClick={onStartRace}>
              Start race
            </Button>
          ) : (
            <Button type="button" onClick={onPlayAgain}>
              Play again
            </Button>
          )}
          {phase === "results" && youResult?.finished ? (
            <ShareResultButton
              wpm={youResult.wpm}
              accuracy={youResult.accuracy}
              placement={youResult.placement}
              name="You"
              mode="Open Race"
            />
          ) : null}
          <Button type="button" variant="secondary" onClick={onEndSession}>
            End session
          </Button>
        </div>
      ) : phase === "lobby" ? (
        <p className="mt-10 text-sm text-chalk-muted">
          Waiting for the host to start…
        </p>
      ) : (
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {youResult?.finished ? (
            <ShareResultButton
              wpm={youResult.wpm}
              accuracy={youResult.accuracy}
              placement={youResult.placement}
              name="You"
              mode="Open Race"
            />
          ) : null}
          <p className="text-sm text-chalk-muted">
            Waiting for the host to rematch…
          </p>
        </div>
      )}
    </PageShell>
  );
}
