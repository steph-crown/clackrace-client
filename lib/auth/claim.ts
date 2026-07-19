import { claimGuestRuns } from "@/lib/api/clack";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";

/** After sign-in/up, reattach guest race rows to the account (PRD §6.6). */
export async function claimGuestSessionIfPresent(): Promise<number> {
  const token = getOrCreateGuestSessionToken();
  if (!token) return 0;
  const res = await claimGuestRuns(token);
  if (!res.ok) return 0;
  return res.data.claimed;
}
