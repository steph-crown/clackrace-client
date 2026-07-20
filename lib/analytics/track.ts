import { getOrCreateGuestSessionToken } from "@/lib/guest-token";

type Props = Record<string, unknown>;

/**
 * Fire-and-forget first-party analytics (PRD Phase 9).
 * Never throws; failures are silent.
 */
export function track(
  name: string,
  props?: Props,
  extras?: { sessionId?: string },
): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (!trimmed) return;

  const body = {
    name: trimmed,
    guestSessionToken: getOrCreateGuestSessionToken() || undefined,
    sessionId: extras?.sessionId,
    props: props ?? {},
    path: window.location.pathname + window.location.search,
  };

  void fetch("/api/clack/analytics/events", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}
