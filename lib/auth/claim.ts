import { claimGuestRuns } from "@/lib/api/clack";
import {
  clearGuestSessionToken,
  getOrCreateGuestSessionToken,
} from "@/lib/guest-token";

/**
 * After sign-in/up, reattach guest race rows to the account (PRD §6.6).
 * Always clears the guest token afterward so logout → guest → another login
 * cannot attach races under the previous claim key.
 */
export async function claimGuestSessionIfPresent(): Promise<number> {
  const token = getOrCreateGuestSessionToken();
  if (!token) return 0;
  try {
    const res = await claimGuestRuns(token);
    return res.ok ? res.data.claimed : 0;
  } finally {
    clearGuestSessionToken();
  }
}
