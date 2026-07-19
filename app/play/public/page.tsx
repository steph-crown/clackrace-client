"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPublicSession } from "@/lib/api/client";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";

export default function CreatePublicSessionPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    const token = getOrCreateGuestSessionToken();
    const session = await createPublicSession(token);
    if (!session) {
      setError("Could not create a race session. Is the server running?");
      setBusy(false);
      return;
    }
    router.push(`/play/${session.id}`);
  };

  return (
    <main className="asphalt-grain flex min-h-dvh flex-col px-5 py-10 sm:px-8">
      <Link href="/play" className="font-logo text-2xl text-chalk sm:text-3xl">
        Clack<span className="text-cyan">Race</span>
      </Link>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-16">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Public Multiplayer
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
          Open a race
        </h1>
        <p className="mt-3 max-w-lg text-chalk-muted">
          You&apos;ll get a shareable link. Anyone with it can join — no account
          needed.
        </p>

        {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          className="mt-10 w-full rounded-sm bg-cyan px-6 py-4 font-heading text-sm font-bold uppercase tracking-wider text-asphalt disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
        >
          {busy ? "Creating…" : "Create race"}
        </button>
      </div>
    </main>
  );
}
