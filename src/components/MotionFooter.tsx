/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Motion Footer — built from scratch (21st.dev motion-footer reference)
 * Footer with nav links, email, WhatsApp, and copyright line.
 */

import React from "react";
import { motion } from "motion/react";
import { Mail, ArrowUpRight, Phone } from "lucide-react";
import { CONTACT_EMAIL } from "../data";

export function MotionFooter({ className = "" }: { className?: string }) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <footer
      className={`relative border-t border-white/5 bg-black py-16 px-6 md:px-12 select-none ${className}`}
    >
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.03]">
        <div className="w-[1px] bg-neutral-500 h-full ml-16" />
        <div className="w-[1px] bg-neutral-500 h-full" />
        <div className="w-[1px] bg-neutral-500 h-full mr-16" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="font-heading italic text-2xl md:text-3xl text-white leading-tight">
              Ready for a website that works?
            </h3>
            <p className="mt-2 text-sm text-white/60 font-body font-light">
              Available for freelance web development — clinics, academies,
              sports foundations, and service businesses.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Project%20Inquiry%20%E2%80%94%20via%20{{PRODUCTION_DOMAIN}}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-indigo-400 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              <a
                href={`https://wa.me/{{WHATSAPP_NUMBER}}?text=${encodeURIComponent("Hi Suman, I saw your portfolio and I'd like a website for my business")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-white" />
                WhatsApp
              </a>
            </div>

            <div className="flex gap-6 md:gap-8 text-xs font-mono text-white/40 uppercase tracking-widest">
              <a
                href="#space"
                className="hover:text-white transition-colors"
              >
                Work
              </a>
              <a
                href="#capabilities"
                className="hover:text-white transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest"
          >
            © {new Date().getFullYear()} Suman — Built for local businesses
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest"
          >
            {reducedMotion ? "Reduced motion enabled" : "Smooth scroll enabled"}
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
