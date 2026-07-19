"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPublicSession } from "@/lib/api/client";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";

export default function ModeSelectPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const startPublic = async () => {
    setCreating(true);
    const session = await createPublicSession(getOrCreateGuestSessionToken());
    if (!session) {
      setCreating(false);
      router.push("/play/public");
      return;
    }
    router.push(`/play/${session.id}`);
  };

  return (
    <main className="asphalt-grain flex min-h-dvh flex-col px-5 py-10 sm:px-8">
      <Link href="/" className="font-logo text-2xl text-chalk sm:text-3xl">
        Clack<span className="text-cyan">Race</span>
      </Link>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-16">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Select mode
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
          How do you want to race?
        </h1>

        <ul className="mt-12 grid gap-4">
          <li>
            <Link
              href="/play/solo"
              className="flex flex-col rounded-sm border border-lane bg-asphalt-raised px-6 py-5 transition-colors hover:border-cyan/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-chalk">
                  Race CPU
                </h2>
                <p className="mt-1 text-sm text-chalk-muted">
                  Solo practice. Instant start.
                </p>
              </div>
              <span className="mt-3 font-heading text-xs font-semibold uppercase tracking-wider text-cyan sm:mt-0">
                Go →
              </span>
            </Link>
          </li>

          <li>
            <button
              type="button"
              disabled={creating}
              onClick={() => void startPublic()}
              className="flex w-full flex-col rounded-sm border border-lane bg-asphalt-raised px-6 py-5 text-left transition-colors hover:border-magenta/50 disabled:opacity-60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-chalk">
                  Public Multiplayer
                </h2>
                <p className="mt-1 text-sm text-chalk-muted">
                  Share a link. Anyone can join.
                </p>
              </div>
              <span className="mt-3 font-heading text-xs font-semibold uppercase tracking-wider text-magenta sm:mt-0">
                {creating ? "…" : "Go →"}
              </span>
            </button>
          </li>

          <li>
            <div className="flex flex-col rounded-sm border border-lane/60 bg-asphalt-raised/50 px-6 py-5 opacity-60 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-chalk">
                  Challenge a Friend
                </h2>
                <p className="mt-1 text-sm text-chalk-muted">
                  Signed-in direct race.
                </p>
              </div>
              <span className="mt-3 font-heading text-xs font-semibold uppercase tracking-wider text-chalk-muted sm:mt-0">
                Soon
              </span>
            </div>
          </li>
        </ul>
      </div>
    </main>
  );
}
