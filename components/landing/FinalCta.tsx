import { ButtonLink } from "@/components/ui/ButtonLink";

export function FinalCta() {
  return (
    <section
      data-landing-section="cta"
      className="asphalt-grain relative z-20 overflow-hidden px-5 py-28 sm:px-8"
    >
      <div className="checkered-strip absolute inset-x-0 top-0 h-2" />
      <div className="checkered-strip absolute inset-x-0 bottom-0 h-2" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-logo text-4xl tracking-wide text-chalk sm:text-6xl">
          Ready to <span className="text-cyan">clack?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-chalk-muted">
          Jump straight into a race. Account optional — unless you&apos;re challenging a friend.
        </p>
        <ButtonLink href="/play" size="lg" className="mt-10">
          Play now
        </ButtonLink>
      </div>
    </section>
  );
}
