import { STATIC_PASSAGES, type Passage } from "@/lib/passages";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export type SoloResultPayload = {
  passageId: string;
  guestSessionToken: string;
  carColor: string;
  finalWpm: number;
  finalAccuracy: number;
  placement: number;
  participantCount: number;
  cpuDifficulty: "easy" | "medium" | "hard" | "expert";
  cpuCount: number;
  durationMs: number;
  mistakes: number;
  keystrokes: { charIndex: number; timestampMs: number }[];
  /** Client-reported passage text length for server cross-check. */
  passageLength: number;
};

export async function fetchPassages(): Promise<Passage[]> {
  try {
    const res = await fetch(`${API_BASE}/passages`);
    if (!res.ok) throw new Error(`passages ${res.status}`);
    const data = (await res.json()) as { passages: Passage[] };
    if (!Array.isArray(data.passages) || data.passages.length === 0) {
      return STATIC_PASSAGES;
    }
    return data.passages;
  } catch {
    return STATIC_PASSAGES;
  }
}

export async function submitSoloResult(
  payload: SoloResultPayload,
): Promise<{ ok: true; raceId: string } | { ok: false }> {
  try {
    const res = await fetch(`${API_BASE}/races/solo/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { raceId: string };
    return { ok: true, raceId: data.raceId };
  } catch {
    return { ok: false };
  }
}

export function getApiBase(): string {
  return API_BASE;
}

export type SessionInfo = {
  id: string;
  status: "waiting" | "racing" | "ended";
  members: {
    id: string;
    displayName: string;
    carColor: string;
    isCreator: boolean;
    pending: boolean;
    disconnected: boolean;
  }[];
  takenNames: string[];
  leaderboard: {
    memberId: string;
    displayName: string;
    bestWpm: number;
    racesPlayed: number;
  }[];
  playerCount: number;
  maxPlayers: number;
};

export async function createPublicSession(
  guestSessionToken: string,
): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/sessions/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestSessionToken }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { id: string };
  } catch {
    return null;
  }
}

export async function fetchSession(
  id: string,
): Promise<SessionInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/sessions/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as SessionInfo;
  } catch {
    return null;
  }
}
