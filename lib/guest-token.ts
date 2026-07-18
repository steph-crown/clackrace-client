const STORAGE_KEY = "clackrace_guest_session_token";

function randomToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `guest_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/** sessionStorage-backed guest token for claiming races at signup (PRD §6.6). */
export function getOrCreateGuestSessionToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const token = randomToken();
    sessionStorage.setItem(STORAGE_KEY, token);
    return token;
  } catch {
    return randomToken();
  }
}
