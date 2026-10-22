/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Bento Grid — built from scratch (21st.dev bento-grid reference)
 * Asymmetric capability tiles with subtle hover motion.
 * Respects prefers-reduced-motion.
 */

import React from "react";
import { motion } from "motion/react";
import { Globe2, Megaphone, Share2, CalendarCheck, Search } from "lucide-react";

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
    id: "websites",
    title: "Websites that fit your business",
    description:
      "A custom, mobile-first site built around how customers actually find and choose you — not a template with your logo dropped in.",
    icon: Globe2,
    gradient: "from-indigo-500/20 to-purple-500/20",
    span: { cols: 2, rows: 1 },
  },
  {
    id: "seo",
    title: "Found on Google",
    description:
      "Clear page structure, local search basics, and copy that answers the questions customers are already typing.",
    icon: Search,
    gradient: "from-indigo-500/10 to-indigo-500/10",
    span: { cols: 1, rows: 1 },
  },
  {
    id: "ads",
    title: "Ads that bring enquiries",
    description:
      "Google and Meta campaigns set up, measured, and adjusted to turn attention into calls and messages.",
    icon: Megaphone,
    gradient: "from-purple-500/10 to-purple-500/10",
    span: { cols: 1, rows: 1 },
  },
  {
    id: "social",
    title: "Social media handled",
    description:
      "A steady presence on the platforms your customers already use, without you chasing every post.",
    icon: Share2,
    gradient: "from-pink-500/10 to-pink-500/10",
    span: { cols: 1, rows: 1 },
  },
  {
    id: "booking",
    title: "Enquiries that land",
    description:
      "Contact forms, WhatsApp, appointment requests, and a simple follow-up flow so good leads do not sit unanswered.",
    icon: CalendarCheck,
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
      className={`bento-grid grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}
    >
      {TILES.map((tile) => {
        const Icon = tile.icon;
        const colClass = tile.span.cols === 2 ? "md:col-span-2" : "md:col-span-1";
        const rowClass = tile.span.rows === 2 ? "md:row-span-2" : "md:row-span-1";
        return (
          <div
            key={tile.id}
            className={`bento-drift col-span-1 ${colClass} ${rowClass}`}
          >
            <motion.div
              whileHover={reducedMotion ? {} : { y: -4 }}
              className="h-full rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-6 md:p-8 flex flex-col gap-3 group transition-all hover:bg-white/[0.03] hover:border-white/20"
              style={{ background: tile.gradient }}
            >
              <div className="h-10 w-10 rounded-xl bg-white/[0.08] flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <h3 className="font-heading italic text-xl md:text-2xl text-white leading-tight">
                {tile.title}
              </h3>
              <p className="text-sm text-white/65 font-body font-light leading-relaxed">
                {tile.description}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
