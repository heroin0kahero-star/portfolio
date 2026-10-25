/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FadingVideo } from "../FadingVideo";
import { BentoGrid } from "../BentoGrid";
import { ScrollFilterHeading } from "../ScrollFilterHeading";

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden z-10 bg-[radial-gradient(circle_at_bottom,#1a1a2e_0%,#000_70%)] pt-24 pb-16 border-t border-white/5"
    >
      {/* Full-bleed background video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <FadingVideo
          src="/videos/hero/capabilities.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 px-6 md:px-16 lg:px-20 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between">
        <div className="max-w-3xl text-left select-none">
          <div className="text-xs tracking-widest uppercase text-white/60 font-body font-semibold mb-3">
            Capabilities
          </div>
          <ScrollFilterHeading className="font-heading italic text-white text-6xl md:text-8xl leading-[0.85] tracking-[-3px]">
            Production,
            <br />
            evolved
          </ScrollFilterHeading>
          <p className="mt-6 max-w-xl font-body text-sm font-light leading-relaxed text-white/55 md:text-base">
            One partner for the website, the Google listing, the ads, and the social
            presence behind it.
          </p>
        </div>

        <div className="mt-16 w-full">
          <BentoGrid />
        </div>
      </div>
    </section>
  );
}
