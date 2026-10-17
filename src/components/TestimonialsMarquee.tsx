/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Testimonials Marquee — built from scratch (21st.dev testimonials-with-marquee reference)
 * Horizontal scrolling strip of live client builds. Pauses on hover.
 * Real client quotes ONLY — uses live project URLs from data.ts.
 */

import React, { useRef, useEffect, useState } from "react";
import { useMotionValue, useTransform, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PORTFOLIO_PROJECTS } from "../data";

const LIVE_PROJECTS = PORTFOLIO_PROJECTS.filter((p) => p.siteUrl);

export function TestimonialsMarquee({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Reduced motion: static strip instead of scrolling
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const container = containerRef.current;
    const content = container.querySelector(".marquee-content") as HTMLElement;
    if (!content) return;

    const contentWidth = content.scrollWidth;
    const containerWidth = container.clientWidth;

    // Only scroll if content is wider than container
    if (contentWidth <= containerWidth) return;

    const x = useMotionValue(0);
    const xTransform = useTransform(x, [0, -contentWidth], [-contentWidth, 0]);

    // We can't easily use motion values without a motion component in the render,
    // so use a CSS animation approach via requestAnimationFrame
    let position = 0;
    let rafId: number;

    const animate = () => {
      if (isPaused) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      position -= 0.5;
      if (position <= -contentWidth) {
        position = containerWidth;
      }
      content.style.transform = `translateX(${position}px)`;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [isPaused, reducedMotion]);

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden py-12 border-t border-white/5 bg-black ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.03]">
        <div className="w-[1px] bg-neutral-500 h-full ml-16" />
        <div className="w-[1px] bg-neutral-500 h-full" />
        <div className="w-[1px] bg-neutral-500 h-full mr-16" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] tracking-widest text-white/40 uppercase font-mono">
            Live Client Builds
          </span>
          <div className="h-1 w-[60px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div
          className="marquee-content flex items-center gap-8 md:gap-16 whitespace-nowrap will-change-transform"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {LIVE_PROJECTS.map((p) => (
            <a
              key={p.id}
              href={p.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 border border-white/10 bg-white/[0.03] rounded-full px-5 py-3 transition-all hover:bg-white/[0.06] hover:border-white/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-white/35 group-hover:text-white/70 transition-colors">
                  {p.client}
                </span>
                <span className="font-body font-medium text-sm text-white/85 truncate max-w-[200px]">
                  {p.title}
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
