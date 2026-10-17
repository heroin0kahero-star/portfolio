"use client";

import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { CONTACT_EMAIL, WHATSAPP_NUMBER, WHATSAPP_MESSAGE, CITY } from "../../data";

export function ContactSection() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=Project inquiry`;

  return (
    <section
      id="contact"
      className="py-24 px-6 lg:px-12 bg-white/[0.02]"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-ink mb-6">
              Contact
            </h2>
            <p className="text-base text-muted leading-relaxed max-w-[55ch] mb-8">
              Have a project in mind? Send me an email or message me on
              WhatsApp. I respond within 24 hours.
            </p>

            <div className="space-y-4">
              <a
                href={mailtoUrl}
                className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold hover:bg-white/10 transition-colors group"
              >
                <Mail className="h-4 w-4 text-ink group-hover:text-accent transition-colors" />
                <span>{CONTACT_EMAIL}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold hover:bg-white/10 transition-colors group"
              >
                <Phone className="h-4 w-4 text-ink group-hover:text-accent transition-colors" />
                <span>WhatsApp — {WHATSAPP_NUMBER} ({CITY})</span>
              </a>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 md:p-8 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
            <h3 className="text-lg font-bold text-ink mb-4">Get in touch</h3>
            <p className="text-sm text-muted mb-6">
              Tell me about your project, your timeline, and your budget. I'll
              send back a clear estimate in INR.
            </p>
            <div className="flex gap-3">
              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent text-ground px-6 py-3 text-sm font-bold shadow-[2px_2px_0px_rgba(190,24,93,0.25)] active:translate-[1px_1px] active:shadow-none transition-all"
              >
                Email Suman
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 text-ink px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
              >
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[11px] font-mono text-muted uppercase tracking-widest">
          <span>© {new Date().getFullYear()} Suman — Bangalore, India</span>
          <a
            href="#"
            className="hover:text-ink transition-colors"
          >
            Back to top
          </a>
        </footer>
      </div>
    </section>
  );
}
