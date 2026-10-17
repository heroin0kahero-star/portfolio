/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, type Variants } from "motion/react";
import { FadingVideo } from "../FadingVideo";
import { BlurText } from "../BlurText";
import { TextRotate } from "../TextRotate";
import { BentoGrid } from "../BentoGrid";
import { TestimonialsMarquee } from "../TestimonialsMarquee";

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
            <TextRotate
              words={["clinics", "salons", "academies", "clubs", "local businesses"]}
              prefix="I build websites for"
              className="mt-8"
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

        {/* Social Proof Marquee */}
        <TestimonialsMarquee />
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
          <div className="mt-16 w-full">
            <BentoGrid />
          </div>

        </div>

      </div>

    </section>
  );
}
