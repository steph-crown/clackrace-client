"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { createPublicSession } from "@/lib/api/client";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";

export default function CreatePublicSessionPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    const session = await createPublicSession(getOrCreateGuestSessionToken());
    if (!session) {
      setError("Could not create a race session. Is the server running?");
      setBusy(false);
      return;
    }
    router.push(`/play/${session.id}`);
  };

  return (
    <PageShell centered logoHref="/play">
      <Eyebrow>Open Race</Eyebrow>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        Open a race
      </h1>
      <p className="mt-3 max-w-lg text-chalk-muted">
        You&apos;ll get a shareable link. Anyone with it can join — no account
        needed.
      </p>
      {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}
      <Button
        type="button"
        disabled={busy}
        onClick={() => void create()}
        className="mt-10 sm:min-w-[220px]"
        fullWidth
      >
        {busy ? "Creating…" : "Create race"}
      </Button>
    </PageShell>
  );
}
