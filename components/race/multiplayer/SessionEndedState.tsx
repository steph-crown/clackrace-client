import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";

export function SessionEndedState() {
  return (
    <PageShell centered logoHref="/play">
      <h1 className="font-heading text-3xl font-bold uppercase text-chalk">
        Session ended
      </h1>
      <ButtonLink href="/play" className="mt-8">
        Back to races
      </ButtonLink>
    </PageShell>
  );
}
