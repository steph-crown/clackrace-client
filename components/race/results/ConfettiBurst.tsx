"use client";

import { useEffect, useRef } from "react";

type ConfettiBurstProps = {
  active: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
};

const COLORS = ["#2ee6d6", "#f5c542", "#ff4ecd", "#e8e6e1", "#7c5cff", "#c0c7d4"];

/**
 * Canvas confetti for 1st place — longer celebration (~4–5s) with respawns.
 * Skips when `prefers-reduced-motion: reduce`.
 */
export function ConfettiBurst({ active }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let running = true;
    const started = performance.now();
    const DURATION_MS = 4800;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = Math.max(parent?.clientHeight ?? 0, 320);
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const spawn = (count: number) => {
      const w = canvas.width / window.devicePixelRatio;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: w * 0.5 + (Math.random() - 0.5) * w * 0.7,
          y: -12 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 5,
          vy: 1.2 + Math.random() * 3.2,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.18,
          w: 4 + Math.random() * 6,
          h: 6 + Math.random() * 10,
          color: COLORS[i % COLORS.length]!,
          life: 1,
        });
      }
    };

    spawn(110);
    let lastBurst = 0;

    const tick = (now: number) => {
      if (!running) return;
      const elapsed = now - started;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      // Keep raining for most of the celebration window
      if (elapsed < DURATION_MS - 800 && now - lastBurst > 420) {
        spawn(28);
        lastBurst = now;
      }

      particles = particles.filter((p) => p.life > 0 && p.y < h + 24);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.vr;
        p.life -= 0.0035;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < DURATION_MS || particles.length > 0) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-80 w-full"
      aria-hidden
    />
  );
}
