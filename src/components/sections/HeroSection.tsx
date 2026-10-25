/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, type Variants } from "motion/react";
import { FadingVideo } from "../FadingVideo";
import { BlurText } from "../BlurText";

export function HeroSection() {
  const entranceVariants: Variants = {
    hidden: { filter: "blur(10px)", opacity: 0, y: 20 },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section
      id="top"
      className="relative min-h-[100svh] bg-[radial-gradient(circle_at_top,#1a1a2e_0%,#000_70%)] text-white overflow-hidden scroll-smooth selection:bg-white/20"
    >
      <h1 className="sr-only">
        Suman — web developer, ads, and social media for local businesses
      </h1>
      <div className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden z-0">
        {/* Cinematic underlay video */}
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none z-0">
          <FadingVideo
            src="/videos/hero/hero.mp4"
            className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top"
            style={{ width: "120%", height: "120%" }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 max-w-5xl mx-auto w-full">
          <div className="mt-12 w-full flex flex-col justify-center items-center select-none">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 font-syne font-bold text-[10px] md:text-xs tracking-[6px] uppercase text-neutral-400"
            >
              Websites · Ads · Social
            </motion.div>

            <BlurText
              text="HELLO, I'M"
              className="text-[clamp(1.5rem,6vw,3rem)] md:text-5xl lg:text-6xl font-montserrat font-extrabold text-neutral-400 tracking-widest text-center uppercase mb-2"
            />
            <BlurText
              text="SUMAN"
              className="text-[clamp(2.5rem,13vw,5.5rem)] md:text-[11rem] lg:text-[14rem] font-syne font-extrabold text-white leading-[0.9] max-w-full tracking-normal text-center uppercase drop-shadow-[0_0_60px_rgba(255,255,255,0.3)] select-all w-full break-words"
            />

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
              className="mt-8 max-w-2xl text-balance font-body text-sm leading-relaxed text-white/65 sm:text-base md:text-lg"
            >
              I build websites, run ads, and manage social media for local businesses.
            </motion.p>
          </div>
        </div>

        {/* Real-client signal */}
        <motion.div
          variants={entranceVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 1.4 }}
          className="relative z-10 flex flex-col items-center gap-4 pb-24 pt-8 text-center md:pb-16"
        >
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/70 tracking-widest uppercase border border-white/5 border-dashed">
            Building for real clients
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-2">
            {["Zenvora", "Kites Sports", "Play 365", "Titan FA"].map((name) => (
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
    </section>
  );
}
