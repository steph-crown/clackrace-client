"use client";

import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

/** Auth hits same-origin `/api/auth` (Next rewrite → Fastify). */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [usernameClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
