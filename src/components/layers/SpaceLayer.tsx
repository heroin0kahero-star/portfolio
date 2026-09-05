/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, type Variants } from "motion/react";
import { FadingVideo } from "../FadingVideo";
import { BlurText } from "../BlurText";

// Built-in SVG ArrowUpRight icon
function ArrowUpRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

// Built-in SVG PlayIcon (filled)
function PlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <polygon points="6 4 20 12 6 20" />
    </svg>
  );
}

export function SpaceLayer() {
  const entranceVariants: Variants = {
    hidden: { filter: "blur(10px)", opacity: 0, y: 20 },
    visible: { 
      filter: "blur(0px)", 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section className="relative min-h-screen bg-[radial-gradient(circle_at_top,#1a1a2e_0%,#000_70%)] text-white overflow-hidden scroll-smooth selection:bg-white/20">
      
      {/* SECTION 1: HERO VIEW */}
      <div className="relative min-h-screen flex flex-col justify-between overflow-hidden Z-0">
        
        {/* Cinematic Underlay Video - Top aligned, centered horizontally, 120% scale */}
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none z-0">
          <FadingVideo
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
            className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top"
            style={{ width: "120%", height: "120%" }}
          />
        </div>


        {/* Hero Interactive Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 max-w-5xl mx-auto w-full">
          
          {/* Premium Huge Display Headline: HELLO, I'M SUMAN */}
          <div className="mt-12 w-full flex flex-col justify-center items-center select-none">
            
            {/* Elegant Sub-Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 font-syne font-bold text-[10px] md:text-xs tracking-[6px] uppercase text-neutral-400"
            >
              portfolio showcase v2
            </motion.div>

            <BlurText 
              text="HELLO, I'M" 
              className="text-[clamp(1.5rem,6vw,3rem)] md:text-5xl lg:text-6xl font-montserrat font-extrabold text-neutral-400 tracking-widest text-center uppercase mb-2"
            />
            <BlurText 
              text="SUMAN" 
              className="text-[clamp(2.5rem,13vw,5.5rem)] md:text-[11rem] lg:text-[14rem] font-syne font-extrabold text-white leading-[0.9] max-w-full tracking-normal text-center uppercase drop-shadow-[0_0_60px_rgba(255,255,255,0.3)] select-all w-full break-words"
            />
          </div>


        </div>

        {/* Partners Footer area */}
        <motion.div
          variants={entranceVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 1.4 }}
          className="relative z-10 flex flex-col items-center gap-4 pb-12 pt-8 text-center"
        >
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/70 tracking-widest uppercase border border-white/5 border-dashed">
            Building for real clients
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-2">
            {["Suman Project", "Kites Sports", "Play 365", "Titan FA"].map((name) => (
              <span
                key={name}
                className="font-heading italic text-xl md:text-2xl text-white/40 hover:text-white/80 transition-colors select-none tracking-tight cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* SECTION 2: CAPABILITIES VIEW */}
      <div id="capabilities" className="relative min-h-screen flex flex-col justify-between overflow-hidden z-10 bg-[radial-gradient(circle_at_bottom,#1a1a2e_0%,#000_70%)] pt-24 pb-12 border-t border-white/5">
        
        {/* Full Bleed Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <FadingVideo
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Capabilities Interactive Area */}
        <div className="relative z-10 px-6 md:px-16 lg:px-20 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between">
          
          {/* Section Heading Header */}
          <div className="max-w-3xl text-left select-none">
            <div className="text-xs tracking-widest uppercase text-white/60 font-body font-semibold mb-3">
              // Capabilities
            </div>
            <h2 className="font-heading italic text-white text-6xl md:text-8xl leading-[0.85] tracking-[-3px]">
              Production
              <br />
              evolved
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
            
            {/* Card 1: AI Scenery */}
            <div className="liquid-glass border border-white/5 rounded-[1.25rem] p-6 lg:p-8 min-h-[360px] flex flex-col justify-between group hover:border-white/20 transition-all shadow-lg">
              <div className="flex items-start justify-between gap-4">
                {/* Nested 44x44 liquid-glass square */}
                <div className="h-11 w-11 rounded-[0.75rem] border border-white/10 bg-white/5 flex items-center justify-center text-white">
                  {/* AI Scenery Image Path Icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z" />
                  </svg>
                </div>
                {/* Right compact flow tag display */}
                <div className="flex flex-wrap justify-end gap-1 max-w-[70%]">
                  {["Fluid Layout", "Mobile First", "Flex Grid"].map((tag) => (
                    <span key={tag} className="text-[9px] font-body text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-12 text-left">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-3">
                  Responsive Interfaces
                </h3>
                <p className="text-sm text-white/70 font-body font-light leading-snug max-w-[32ch]">
                  Every build adapts fluidly from pocket-sized phones to ultra-wide cinema screens without losing an ounce of intent.
                </p>
              </div>
            </div>

            {/* Card 2: Batch Production */}
            <div className="liquid-glass border border-white/5 rounded-[1.25rem] p-6 lg:p-8 min-h-[360px] flex flex-col justify-between group hover:border-white/20 transition-all shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="h-11 w-11 rounded-[0.75rem] border border-white/10 bg-white/5 flex items-center justify-center text-white">
                  {/* Batch Production Movie Icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z" />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-end gap-1 max-w-[70%]">
                  {["Component Driven", "Performance", "Clean Code"].map((tag) => (
                    <span key={tag} className="text-[9px] font-body text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-12 text-left">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-3">
                  Fast, Clean Code
                </h3>
                <p className="text-sm text-white/70 font-body font-light leading-snug max-w-[32ch]">
                  Component-driven development ships quickly and keeps a consistent, maintainable codebase for every future page.
                </p>
              </div>
            </div>

            {/* Card 3: Smart Lighting */}
            <div className="liquid-glass border border-white/5 rounded-[1.25rem] p-6 lg:p-8 min-h-[360px] flex flex-col justify-between group hover:border-white/20 transition-all shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="h-11 w-11 rounded-[0.75rem] border border-white/10 bg-white/5 flex items-center justify-center text-white">
                  {/* Smart Lighting Lightbulb Icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z" />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-end gap-1 max-w-[70%]">
                  {["GSAP", "WebGL", "Micro Interactions"].map((tag) => (
                    <span key={tag} className="text-[9px] font-body text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-12 text-left">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-3">
                  Interactive Motion
                </h3>
                <p className="text-sm text-white/70 font-body font-light leading-snug max-w-[32ch]">
                  GSAP and WebGL-driven motion keeps visitors engaged from the first scroll to the final interaction.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
