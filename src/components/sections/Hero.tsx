"use client";

import { motion } from "motion/react";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center px-6 lg:px-12"
    >
      {/* Skip link for keyboard users */}
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-ground focus:rounded focus:outline-none"
      >
        Skip to work
      </a>

      <div className="relative z-10 max-w-[700px]">
        <span className="inline-block mb-6 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-accent border border-accent rounded">
          Freelance web designer &amp; developer
        </span>

        <h1 className="mb-6 text-4xl md:text-6xl font-bold tracking-tighter leading-none text-ink">
          Suman designs and builds websites for growing businesses.
        </h1>

        <p className="mb-8 text-base text-muted max-w-[60ch] leading-relaxed">
          I'm Suman, a freelance web designer and developer in Bangalore. I
          build fast, responsive websites that help local businesses and
          organisations get online — no jargon, no hidden costs.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-accent bg-accent text-ground px-6 py-3 text-sm font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.25)] active:translate-[1px_1px] active:shadow-none transition-all"
          >
            Start a project
          </a>
          <a
            href="#work"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 text-ink px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
          >
            See my work
          </a>
        </div>
      </div>
    </section>
  );
}
