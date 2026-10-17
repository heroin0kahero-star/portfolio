/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Bento Grid — built from scratch (21st.dev bento-grid reference)
 * Asymmetric capability tiles with subtle hover motion.
 * Respects prefers-reduced-motion.
 */

import React from "react";
import { motion } from "motion/react";
import { Code2, Zap, ShieldCheck, Activity, BarChart3 } from "lucide-react";

interface BentoTile {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  span: { cols: number; rows: number };
}

const TILES: BentoTile[] = [
  {
    id: "responsive",
    title: "Responsive Interfaces",
    description:
      "Every build adapts fluidly from pocket-sized phones to ultra-wide screens without losing intent.",
    icon: BarChart3,
    gradient: "from-indigo-500/20 to-purple-500/20",
    span: { cols: 2, rows: 2 },
  },
  {
    id: "clean-code",
    title: "Clean, Fast Code",
    description:
      "Component-driven development ships quickly and stays maintainable for every future page.",
    icon: Code2,
    gradient: "from-indigo-500/10 to-indigo-500/10",
    span: { cols: 1, rows: 1 },
  },
  {
    id: "interactive-motion",
    title: "Interactive Motion",
    description:
      "GSAP and WebGL-driven motion keeps visitors engaged from first scroll to final interaction.",
    icon: Zap,
    gradient: "from-purple-500/10 to-purple-500/10",
    span: { cols: 1, rows: 1 },
  },
  {
    id: "speed",
    title: "Speed Optimized",
    description:
      "Lazy-loaded assets, compressed media, and critical CSS for fast first paint.",
    icon: Activity,
    gradient: "from-pink-500/10 to-pink-500/10",
    span: { cols: 1, rows: 1 },
  },
  {
    id: "booking-ready",
    title: "Booking Ready",
    description:
      "Appointment systems, contact forms, and CMS built in for service businesses.",
    icon: ShieldCheck,
    gradient: "from-emerald-500/10 to-emerald-500/10",
    span: { cols: 1, rows: 1 },
  },
];

export function BentoGrid({ className = "" }: { className?: string }) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}
      style={{ gridTemplateRows: "repeat(2, minmax(240px, auto))" }}
    >
      {TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <motion.div
            key={tile.id}
            whileHover={reducedMotion ? {} : { y: -4 }}
            className={`col-span-${tile.span.cols} row-span-${tile.span.rows} rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-6 md:p-8 flex flex-col gap-3 group transition-all hover:bg-white/[0.03] hover:border-white/20`}
            style={{
              background: tile.gradient,
            }}
          >
            <div className="h-10 w-10 rounded-xl bg-white/[0.08] flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-heading italic text-xl md:text-2xl text-white leading-tight">
              {tile.title}
            </h3>
            <p className="text-sm text-white/60 font-body font-light leading-relaxed">
              {tile.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
