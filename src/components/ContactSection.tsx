/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import {
  CONTACT_EMAIL,
  PROJECT_INQUIRY_SUBJECT,
  WHATSAPP_URL,
} from "../data";

const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(PROJECT_INQUIRY_SUBJECT)}`;

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative min-h-[80vh] bg-[radial-gradient(circle_at_top,#1a1a2e_0%,#000_70%)] text-white py-24 px-6 md:px-12 flex items-center"
    >
      {/* Editorial linear grid overlay */}
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.05]">
        <div className="w-[1px] bg-neutral-500 h-full ml-16" />
        <div className="w-[1px] bg-neutral-500 h-full" />
        <div className="w-[1px] bg-neutral-500 h-full mr-16" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-14 items-start relative z-10">
        {/* CONTACT COPY */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
          <span className="text-[10px] tracking-[4px] text-white/40 uppercase font-mono flex items-center gap-2">
            <Mail className="h-3 w-3 text-indigo-400" /> Contact
          </span>

          <h2 className="font-heading italic text-5xl md:text-7xl leading-none tracking-[-2px] text-white">
            Tell me what
            <br />
            your business needs.
          </h2>

          <p className="text-sm md:text-base text-white/60 font-body font-light leading-relaxed max-w-xl">
            Whether you are starting from scratch or replacing a site that no longer fits,
            send a short note. I will reply with a clear next step, a realistic timeline,
            and a price before any work begins.
          </p>

          <ul className="mt-2 flex flex-col gap-3 text-sm font-body text-white/70">
            {[
              "A website built around how your customers choose you",
              "Google and Meta ads that turn attention into enquiries",
              "Social media handled without you chasing every post",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
            <MapPin className="h-3 w-3" />
            Bangalore, India · Working with businesses anywhere
          </div>
        </div>

        {/* CONTACT CARD */}
        <div className="lg:col-span-5 lg:pl-8 w-full">
          <div className="liquid-glass-strong rounded-[1.5rem] p-8 md:p-10 border border-white/10 flex flex-col items-start text-left gap-6">
            <span className="text-[10px] tracking-[4px] text-white/40 uppercase font-mono">
              Start a conversation
            </span>

            <h3 className="font-heading italic text-3xl md:text-4xl text-white leading-tight">
              Have a project in mind?
            </h3>

            <p className="text-sm text-white/50 font-body font-light leading-relaxed">
              Email is best for project details. WhatsApp is faster if you just want to ask
              a quick question.
            </p>

            <a
              href={mailtoHref}
              className="mt-2 inline-flex w-full items-center justify-between gap-3 rounded-full bg-white text-black px-6 py-3.5 text-sm font-semibold tracking-wide hover:bg-indigo-400 hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-3">
                <Mail className="h-4 w-4" />
                Email me
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold tracking-wide text-white/90 hover:bg-white/[0.1] hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-3">
                <Phone className="h-4 w-4 text-white" />
                Message on WhatsApp
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/50" />
            </a>

            <div className="flex flex-col gap-1.5 font-mono text-[10px] text-white/35 tracking-widest uppercase">
              <span>Replies within 24 hours</span>
              <span className="normal-case tracking-normal text-white/30">{CONTACT_EMAIL}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
