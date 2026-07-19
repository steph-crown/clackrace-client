"use client";

import { useSession } from "@/lib/auth/client";
import {
  getSignupPromptVariant,
  signupPromptCopy,
} from "@/lib/auth/signup-prompt";
import { ButtonLink } from "@/components/ui/ButtonLink";

/** Non-blocking post-race CTA for guests (PRD §6.6). */
export function SignUpPrompt() {
  const { data: session, isPending } = useSession();
  const copy =
    typeof window === "undefined"
      ? signupPromptCopy("streak")
      : signupPromptCopy(getSignupPromptVariant());

  if (isPending || session?.user) return null;

  return (
    <aside className="mt-8 rounded-sm border border-cyan/30 bg-cyan/5 px-4 py-4 text-left">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-chalk">
        {copy.title}
      </p>
      <p className="mt-1 text-sm text-chalk-muted">{copy.body}</p>
      <div className="mt-3">
        <ButtonLink href="/signin" size="sm">
          Sign up free
        </ButtonLink>
      </div>
    </aside>
  );
}
