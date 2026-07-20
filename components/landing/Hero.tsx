import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/ui/Logo";
import { CarSvg } from "@/components/race/CarSvg";
import { HeroTypingStrip } from "./HeroTypingStrip";
import { HeroAuthCta } from "./HeroAuthCta";
import { SiteNav } from "./SiteNav";

export function Hero() {
  return (
    <section
      data-landing-hero
      className="asphalt-grain relative flex min-h-dvh w-full flex-col overflow-hidden"
    >
      <div className="scanlines pointer-events-none absolute inset-0" />
      <SiteNav />

      {/* Parallax layers — GSAP drives transforms when available */}
      <div
        data-hero-layer="bg"
        className="pointer-events-none absolute inset-0 will-change-transform"
      >
        <div className="absolute inset-x-0 bottom-[18%] h-24 bg-track/80" />
        <div className="absolute inset-x-0 bottom-[18%] h-px bg-lane" />
        <div className="absolute inset-x-0 bottom-[12%] h-16 border-t border-dashed border-chalk-muted/20 bg-asphalt-raised/60" />
      </div>

      <div
        data-hero-layer="mid"
        className="pointer-events-none absolute inset-x-0 bottom-[14%] flex will-change-transform"
      >
        <div className="absolute left-[8%] w-28 opacity-50 sm:w-36">
          <CarSvg bodyColor="var(--magenta)" accentColor="var(--chalk)" />
        </div>
        <div className="absolute right-[12%] w-24 opacity-40 sm:w-32">
          <CarSvg bodyColor="var(--signal)" accentColor="var(--asphalt)" />
        </div>
      </div>

      <div
        data-hero-layer="fg"
        className="pointer-events-none absolute inset-0 will-change-transform"
      >
        {["A", "S", "D", "F", "J", "K", "L", ";"].map((key, i) => (
          <span
            key={key}
            className="absolute flex h-9 w-9 items-center justify-center rounded-sm border border-lane bg-asphalt-raised/70 font-mono text-xs text-chalk-muted shadow-md sm:h-11 sm:w-11 sm:text-sm"
            style={{
              left: `${10 + i * 11}%`,
              top: `${22 + (i % 3) * 8}%`,
              rotate: `${(i % 2 === 0 ? -1 : 1) * (4 + (i % 3))}deg`,
            }}
          >
            {key}
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-28 text-center sm:px-8">
        <p className="mb-4 font-heading text-xs font-semibold uppercase tracking-[0.35em] text-cyan">
          Arcade typing races
        </p>
        <h1><Logo href={undefined} size="lg" /></h1>
        <p className="mt-5 max-w-md font-sans text-base text-chalk-muted sm:text-lg">
          Type the passage. Watch your car fly. Race CPU, friends, or anyone
          with the link.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <HeroAuthCta />
        </div>

        <div className="mt-10 w-full max-w-xl">
          <HeroTypingStrip />
        </div>

        <p
          data-scroll-hint
          className="mt-10 font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-chalk-muted"
        >
          Scroll
          <span className="mt-2 block h-8 w-px bg-gradient-to-b from-chalk-muted to-transparent mx-auto" />
        </p>
      </div>
    </section>
  );
}
