import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

export default function SignInPlaceholderPage() {
  return (
    <PageShell centered>
      <div className="text-center">
        <Eyebrow>Accounts · Phase 5</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-chalk">
          Sign in
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-chalk-muted">
          Accounts are coming next. You can still race as an anonymous player.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/play">Play now</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Home
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
