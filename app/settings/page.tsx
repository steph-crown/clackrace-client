"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe, patchMe } from "@/lib/api/clack";
import { useSession, signOut } from "@/lib/auth/client";
import { CAR_COLOR_PALETTE } from "@/lib/car-colors";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { cn } from "@/lib/utils/cn";

const FONTS = [
  { id: "jetbrains-mono", label: "JetBrains Mono" },
  { id: "ibm-plex-mono", label: "IBM Plex Mono" },
  { id: "space-mono", label: "Space Mono" },
  { id: "system-mono", label: "System Mono" },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [username, setUsername] = useState("");
  const [carColor, setCarColor] = useState("#2ee6d6");
  const [font, setFont] = useState<string>("jetbrains-mono");
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [colors, setColors] = useState<string[]>([...CAR_COLOR_PALETTE]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/signin");
      return;
    }
    void fetchMe().then((res) => {
      if (!res.ok) return;
      setUsername(res.data.user.username ?? res.data.user.name ?? "");
      setCarColor(res.data.user.carColor);
      setFont(res.data.user.font ?? "jetbrains-mono");
      setStreak({
        current: res.data.streak.current,
        longest: res.data.streak.longest,
      });
      if (res.data.carColors?.length) setColors(res.data.carColors);
    });
  }, [session, isPending, router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await patchMe({
      username: username.trim().toLowerCase(),
      carColor,
      font,
    });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.error.message);
      return;
    }
    setMessage("Saved");
  };

  if (isPending || !session?.user) {
    return (
      <PageShell centered>
        <p className="text-chalk-muted">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell centered logoHref="/play">
      <div className="mx-auto w-full max-w-lg">
        <Eyebrow>Profile</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-chalk">
          Settings
        </h1>
        <p className="mt-2 text-sm text-chalk-muted">
          Streak {streak.current} · Best {streak.longest} ·{" "}
          {session.user.email}
        </p>

        <form onSubmit={save} className="mt-8 space-y-6">
          <label className="block">
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
              Username
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={24}
              required
              className="mt-1.5 w-full rounded-sm border border-lane bg-asphalt-raised px-3 py-2.5 font-mono text-sm text-chalk outline-none focus:border-cyan"
            />
          </label>

          <fieldset>
            <legend className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
              Car color
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  aria-pressed={carColor === c}
                  onClick={() => setCarColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-sm border-2 transition-transform",
                    carColor === c
                      ? "scale-110 border-chalk"
                      : "border-transparent opacity-80 hover:opacity-100",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
              Typing font
            </span>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-lane bg-asphalt-raised px-3 py-2.5 font-mono text-sm text-chalk outline-none focus:border-cyan"
            >
              {FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          {message ? (
            <p className="text-sm text-cyan" role="status">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
            <ButtonLink href="/play" variant="secondary">
              Modes
            </ButtonLink>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
            >
              Sign out
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
