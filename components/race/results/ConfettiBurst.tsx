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

const COLORS = ["#2ee6d6", "#f5c542", "#ff4ecd", "#e8e6e1", "#7c5cff"];

/**
 * Lightweight canvas confetti for 1st place.
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

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = parent?.clientHeight ?? 280;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      const w = canvas.width / window.devicePixelRatio;
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: w * 0.5 + (Math.random() - 0.5) * w * 0.4,
          y: -10 - Math.random() * 40,
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.2,
          w: 4 + Math.random() * 5,
          h: 6 + Math.random() * 8,
          color: COLORS[i % COLORS.length]!,
          life: 1,
        });
      }
    };

    spawn();

    const tick = () => {
      if (!running) return;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      particles = particles.filter((p) => p.life > 0 && p.y < h + 20);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rot += p.vr;
        p.life -= 0.008;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (particles.length > 0) {
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
      className="pointer-events-none absolute inset-x-0 top-0 h-64 w-full"
      aria-hidden
    />
  );
}
