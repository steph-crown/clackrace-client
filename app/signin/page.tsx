"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { claimGuestSessionIfPresent } from "@/lib/auth/claim";
import { signIn, signUp } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

type Mode = "signin" | "signup";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await signUp.email({
          email: email.trim(),
          password,
          name: username.trim() || email.split("@")[0] || "Racer",
          username: username.trim().toLowerCase(),
        });
        if (res.error) {
          setError(res.error.message ?? "Sign up failed");
          setBusy(false);
          return;
        }
      } else {
        const res = await signIn.email({
          email: email.trim(),
          password,
        });
        if (res.error) {
          setError(res.error.message ?? "Sign in failed");
          setBusy(false);
          return;
        }
      }
      await claimGuestSessionIfPresent();
      router.push("/play");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  };

  return (
    <PageShell centered logoHref="/">
      <div className="mx-auto w-full max-w-md">
        <Eyebrow>{mode === "signin" ? "Welcome back" : "Create account"}</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-chalk sm:text-4xl">
          {mode === "signin" ? "Sign in" : "Sign up"}
        </h1>
        <p className="mt-2 text-sm text-chalk-muted">
          Guests can still Race CPU and Public Multiplayer. Accounts unlock
          streaks, boards, and Challenge a Friend.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" ? (
            <Field
              label="Username"
              value={username}
              onChange={setUsername}
              autoComplete="username"
              required
              minLength={3}
              maxLength={24}
            />
          ) : null}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            minLength={8}
          />

          {error ? (
            <p className="text-sm text-magenta" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={busy}>
            {busy
              ? "Working…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-chalk-muted">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                type="button"
                className="text-cyan underline-offset-2 hover:underline"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already racing?{" "}
              <button
                type="button"
                className="text-cyan underline-offset-2 hover:underline"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/play" variant="secondary">
            Play as guest
          </ButtonLink>
          <Link
            href="/settings"
            className="font-heading text-xs font-semibold uppercase tracking-wider text-chalk-muted hover:text-chalk"
          >
            Settings
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-sm border border-lane bg-asphalt-raised px-3 py-2.5 font-mono text-sm text-chalk outline-none focus:border-cyan"
        {...rest}
      />
    </label>
  );
}
