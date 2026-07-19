/** Authenticated / cookie-proxied API calls via Next rewrite → Fastify. */

const CLACK = "/api/clack";

async function clackFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error?: string }> {
  try {
    const res = await fetch(`${CLACK}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        ok: false,
        status: res.status,
        error: typeof body.error === "string" ? body.error : undefined,
      };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, status: 0 };
  }
}

export type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    carColor: string;
    font?: string | null;
    avatar?: string | null;
  };
  streak: {
    current: number;
    longest: number;
    lastPlayedDate: string | null;
  };
  fonts: string[];
  carColors: string[];
};

export async function fetchMe() {
  return clackFetch<MeResponse>("/me");
}

export async function patchMe(body: {
  username?: string;
  carColor?: string;
  font?: string | null;
}) {
  return clackFetch<{ user: MeResponse["user"] }>("/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function claimGuestRuns(guestSessionToken: string) {
  return clackFetch<{
    claimed: number;
    streak: { current: number; longest: number };
  }>("/account/claim", {
    method: "POST",
    body: JSON.stringify({ guestSessionToken }),
  });
}

export type LeaderboardScope = "all_time" | "daily" | "weekly";

export async function fetchLeaderboard(scope: LeaderboardScope) {
  return clackFetch<{
    scope: LeaderboardScope;
    entries: {
      rank: number;
      userId: string;
      username: string;
      carColor: string;
      bestWpm: number;
      achievedAt: string;
    }[];
  }>(`/leaderboard?scope=${scope}`);
}

export async function fetchDailyChampion() {
  return clackFetch<{
    champion: {
      day: string;
      userId: string;
      username: string;
      carColor: string;
      bestWpm: number;
    } | null;
  }>("/leaderboard/daily-champion");
}

export type ChallengeRecord = {
  id: string;
  requesterId: string;
  requesterUsername: string;
  recipientId: string;
  recipientEmail: string;
  recipientUsername: string | null;
  status: string;
  delivery: "online" | "offline";
  createdAt: number;
  expiresAt: number;
  sessionId: string | null;
};

export async function createChallenge(target: string) {
  return clackFetch<{
    challenge: ChallengeRecord;
    emailDelivery: string | null;
  }>("/challenges", {
    method: "POST",
    body: JSON.stringify({ target }),
  });
}

export async function respondChallenge(id: string, accept: boolean) {
  return clackFetch<{
    ok: true;
    challenge: ChallengeRecord;
    sessionId: string | null;
  }>(`/challenges/${id}/respond`, {
    method: "POST",
    body: JSON.stringify({ accept }),
  });
}

export async function revokeChallenge(id: string) {
  return clackFetch<{ ok: true }>(`/challenges/${id}/revoke`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchChallenge(id: string) {
  return clackFetch<{ challenge: ChallengeRecord }>(`/challenges/${id}`);
}

export function notificationsStreamUrl() {
  return `${CLACK}/notifications/stream`;
}
