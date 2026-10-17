"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

export function AboutSection() {
  const reduced = useReducedMotion();
  return (
    <section
      id="about"
      className="py-24 px-6 lg:px-12 bg-ground"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="lg:pr-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-ink mb-6">
              About
            </h2>
            <p className="text-base text-muted leading-relaxed max-w-[60ch]">
              I'm Suman, a freelance web designer and developer based in
              Bangalore. I build fast, responsive websites for businesses and
              organisations, with transparent pricing in INR. You'll be dealing
              with one person from start to launch.
            </p>
          </div>

          <motion.div
            whileInView={
              reduced
                ? {}
                : { opacity: [0, 1], y: [20, 0], transition: { duration: 0.5 } }
            }
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            viewport={{ once: true }}
            className="rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 md:p-8 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
          >
            <h3 className="text-lg font-bold text-ink mb-4">The facts</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                <span>Location: Bangalore, India</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                <span>Work: freelance web design &amp; development</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                <span>Contact: sumankd0000@gmail.com</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
