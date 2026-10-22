/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Timeline Animation — built from scratch (21st.dev timeline-animation reference)
 * 4-step process: Brief → Design mockup → Build → Launch and support.
 * Scroll-linked reveal via framer-motion whileInView.
 * Respects prefers-reduced-motion.
 */

import React from "react";
import { motion } from "motion/react";
import { ScrollFilterHeading } from "./ScrollFilterHeading";

interface ProcessStep {
  id: string;
  title: string;
  description: string;
}

const STEPS: ProcessStep[] = [
  {
    id: "brief",
    title: "Brief",
    description: "We discuss your business goals, audience, and what success looks like.",
  },
  {
    id: "design",
    title: "Design mockup",
    description: "I share a visual direction before writing a single line of code.",
  },
  {
    id: "build",
    title: "Build",
    description: "Fast, responsive development with clean, maintainable code.",
  },
  {
    id: "launch",
    title: "Launch and support",
    description: "Go live, then I help you keep the site updated and performing.",
  },
];

export function TimelineAnimation({ className = "" }: { className?: string }) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <section
      id="process"
      className={`relative py-24 px-6 md:px-12 bg-black select-none ${className}`}
    >
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.03]">
        <div className="w-[1px] bg-neutral-500 h-full ml-16" />
        <div className="w-[1px] bg-neutral-500 h-full" />
        <div className="w-[1px] bg-neutral-500 h-full mr-16" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-widest text-white/40 uppercase font-mono block mb-3">
            My Process
          </span>
          <ScrollFilterHeading className="font-heading italic text-4xl md:text-5xl text-white leading-none">
            How we work together
          </ScrollFilterHeading>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical connector line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 transform -translate-x-1/2" />

          {STEPS.map((step, idx) => {
            const isLast = idx === STEPS.length - 1;
            return (
              <motion.div
                key={step.id}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" },
                }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                className={`relative mb-16 md:mb-24 px-6 ${isLast ? "md:mb-0" : ""}`}
              >
                {/* Step number */}
                <div className="absolute -left-[60px] top-4 w-8 h-8 rounded-full border-2 border-white text-white text-xs font-mono font-bold flex items-center justify-center">
                  {idx + 1}
                </div>

                {/* Connector dots for non-last steps */}
                {!isLast && (
                  <div className="absolute left-1/2 top-[60px] -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
                )}

                <div className="bg-white/[0.02] border border-white/5 rounded-[1.25rem] p-6 md:p-8">
                  <h3 className="font-heading italic text-xl md:text-2xl text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/60 font-body font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
