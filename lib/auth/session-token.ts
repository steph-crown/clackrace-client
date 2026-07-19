import { authClient } from "./client";

/** Session token for Socket.IO join (cookies are first-party on :3000, socket hits :4000). */
export async function getSessionToken(): Promise<string | undefined> {
  const { data } = await authClient.getSession();
  return data?.session?.token;
}
