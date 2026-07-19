import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

type JoinErrorStateProps = {
  message: string;
};

export function JoinErrorState({ message }: JoinErrorStateProps) {
  const needsSignIn = /sign in/i.test(message);

  return (
    <PageShell centered logoHref="/play">
      <Eyebrow>Can&apos;t join</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk">
        Race unavailable
      </h1>
      <p className="mt-3 text-chalk-muted">{message}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {needsSignIn ? (
          <ButtonLink href="/signin" size="sm">
            Sign in
          </ButtonLink>
        ) : null}
        <ButtonLink href="/play" variant="secondary" size="sm">
          ← Modes
        </ButtonLink>
      </div>
    </PageShell>
  );
}
