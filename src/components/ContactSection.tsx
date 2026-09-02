/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, ArrowUpRight, Globe, User } from "lucide-react";
import { PORTFOLIO_PROJECTS, CONTACT_EMAIL } from "../data";

export default function ContactSection() {
  const liveProjects = PORTFOLIO_PROJECTS.filter((p) => p.siteUrl);

  return (
    <section
      id="contact"
      className="relative min-h-[80vh] bg-[radial-gradient(circle_at_top,#1a1a2e_0%,#000_70%)] text-white py-24 px-6 md:px-12 select-none flex items-center"
    >
      {/* Editorial linear grid overlay */}
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.05]">
        <div className="w-[1px] bg-neutral-500 h-full ml-16" />
        <div className="w-[1px] bg-neutral-500 h-full" />
        <div className="w-[1px] bg-neutral-500 h-full mr-16" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-14 items-start relative z-10">
        {/* ABOUT */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
          <span className="text-[10px] tracking-[4px] text-white/40 uppercase font-mono flex items-center gap-2">
            <User className="h-3 w-3 text-indigo-400" /> [ABOUT]
          </span>

          <h2 className="font-heading italic text-5xl md:text-7xl leading-none tracking-[-2px] text-white">
            Hi, I&apos;m Suman —
            <br />
            a web developer.
          </h2>

          <p className="text-sm md:text-base text-white/60 font-body font-light leading-relaxed max-w-xl">
            This portfolio is a single-page showcase of the kind of functional front-end work I
            build for real clients — five distinct visual systems (Cinematic Space, Tactile
            Neumorphism, Raw Brutalism, Neo-Brutalist Playground, and an experimental WebGL
            layer) wrapped into one scroll-linked experience.
          </p>

          <p className="text-xs text-white/40 font-mono max-w-xl leading-relaxed">
            You just scrolled through four different functional designs in a single website —
            every layer is a live, interactive demo, not a static mockup. If you need a site like
            this for your brand, studio, or business, let&apos;s talk.
          </p>

          {/* Live client sites */}
          <div className="mt-4 w-full max-w-xl">
            <span className="text-[10px] tracking-widest text-white/40 uppercase font-mono block mb-3">
              Live Client Builds
            </span>
            <div className="flex flex-col gap-2.5">
              {liveProjects.map((p) => (
                <a
                  key={p.id}
                  href={p.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/30 rounded-full px-5 py-3.5 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="font-body font-medium text-sm text-white/85 truncate">
                      {p.title}
                    </span>
                    <span className="font-mono text-[10px] text-white/35 hidden sm:inline">
                      {p.siteUrl.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* CONTACT CARD */}
        <div className="lg:col-span-5 lg:pl-8">
          <div className="liquid-glass-strong rounded-[1.5rem] p-8 md:p-10 border border-white/10 flex flex-col items-start text-left gap-6">
            <span className="text-[10px] tracking-[4px] text-white/40 uppercase font-mono flex items-center gap-2">
              <Mail className="h-3 w-3 text-indigo-400" /> [CONTACT]
            </span>

            <h3 className="font-heading italic text-3xl md:text-4xl text-white leading-tight">
              Have a project in mind?
            </h3>

            <p className="text-sm text-white/50 font-body font-light leading-relaxed">
              Available for freelance web development — from marketing sites and business
              portfolios to full interactive single-page experiences.
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Project%20Inquiry%20%E2%80%94%20via%20suman.design`}
              className="mt-2 inline-flex items-center gap-3 rounded-full bg-white text-black px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-indigo-400 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>

            <span className="font-mono text-[10px] text-white/35 tracking-widest uppercase">
              Response within 24 hours
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}