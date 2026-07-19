import { fetchSocketToken } from "@/lib/api/clack";
import { authClient } from "./client";

/**
 * Session token for Socket.IO join.
 * Prefer client session; fall back to cookie-authenticated REST (proxied).
 */
export async function getSessionToken(): Promise<string | undefined> {
  const { data } = await authClient.getSession();
  const fromClient = data?.session?.token;
  if (fromClient) return fromClient;

  const res = await fetchSocketToken();
  if (res.ok) return res.data.token;
  return undefined;
}
