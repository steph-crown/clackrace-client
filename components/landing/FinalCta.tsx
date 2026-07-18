import Link from "next/link";

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
          Ready to{" "}
          <span className="text-cyan">clack?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-chalk-muted">
          Jump straight into a race. Account optional — unless you&apos;re
          challenging a friend.
        </p>
        <Link
          href="/play"
          className="mt-10 inline-block rounded-sm bg-cyan px-10 py-4 font-heading text-base font-bold uppercase tracking-wider text-asphalt transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Play Now
        </Link>
      </div>
    </section>
  );
}
