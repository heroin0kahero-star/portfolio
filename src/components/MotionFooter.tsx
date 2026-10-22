/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Motion Footer — quiet closing block with contact and section links.
 */

import { motion } from "motion/react";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import {
  CONTACT_EMAIL,
  PROJECT_INQUIRY_SUBJECT,
  WHATSAPP_URL,
} from "../data";

const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(PROJECT_INQUIRY_SUBJECT)}`;

const FOOTER_LINKS = [
  { href: "#about", label: "About" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#pricing", label: "Pricing" },
  { href: "#live-builds", label: "Live builds" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export function MotionFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`relative border-t border-white/5 bg-black py-16 px-6 md:px-12 ${className}`}
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
            <p className="mt-2 max-w-md text-sm text-white/60 font-body font-light leading-relaxed">
              Websites, ads, and social media for clinics, academies, sports foundations,
              and service businesses.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="flex flex-col gap-3">
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-indigo-400 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-white" />
                WhatsApp
              </a>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono text-white/40 uppercase tracking-widest"
            >
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest"
          >
            © {new Date().getFullYear()} Suman · Websites, ads, and social for local businesses
          </motion.div>

          <a
            href="#top"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Back to top <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
