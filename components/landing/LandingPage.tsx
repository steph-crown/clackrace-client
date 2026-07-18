"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { FinalCta } from "./FinalCta";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { ModesShowcase } from "./ModesShowcase";
import { SiteFooter } from "./SiteFooter";
import { SmoothScroll } from "./SmoothScroll";
import { StatsTeaser } from "./StatsTeaser";
import { StreaksSection } from "./StreaksSection";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced) return;

      const hero = rootRef.current?.querySelector<HTMLElement>(
        "[data-landing-hero]",
      );
      if (!hero) return;

      const bg = hero.querySelector("[data-hero-layer='bg']");
      const mid = hero.querySelector("[data-hero-layer='mid']");
      const fg = hero.querySelector("[data-hero-layer='fg']");
      const hint = hero.querySelector("[data-scroll-hint]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      tl.to(hero, { scale: 0.96, opacity: 0.55, ease: "none" }, 0);
      if (bg) tl.to(bg, { yPercent: -8, ease: "none" }, 0);
      if (mid) tl.to(mid, { yPercent: -18, ease: "none" }, 0);
      if (fg) tl.to(fg, { yPercent: -32, ease: "none" }, 0);
      if (hint) tl.to(hint, { opacity: 0, ease: "none" }, 0);

      gsap.utils
        .toArray<HTMLElement>("[data-reveal]", rootRef.current ?? undefined)
        .forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 36,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });
    },
    { scope: rootRef },
  );

  return (
    <SmoothScroll>
      <div ref={rootRef} className="bg-asphalt text-chalk">
        <Hero />
        <HowItWorks />
        <ModesShowcase />
        <StatsTeaser />
        <StreaksSection />
        <FinalCta />
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
