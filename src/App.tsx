/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import { PortfolioLayer } from "./types";

// Lazy-load the five visual design layers so only the first paints on load
// and the rest stream in as the user scrolls.
const SpaceLayer = lazy(() =>
  import("./components/layers/SpaceLayer").then((m) => ({ default: m.SpaceLayer }))
);
const NeumorphismLayer = lazy(() =>
  import("./components/layers/NeumorphismLayer").then((m) => ({ default: m.NeumorphismLayer }))
);
const BrutalismLayer = lazy(() =>
  import("./components/layers/BrutalismLayer").then((m) => ({ default: m.BrutalismLayer }))
);
const NeoBrutalismLayer = lazy(() =>
  import("./components/layers/NeoBrutalismLayer").then((m) => ({ default: m.NeoBrutalismLayer }))
);
const AwwwardsLayer = lazy(() =>
  import("./components/layers/AwwwardsLayer").then((m) => ({ default: m.AwwwardsLayer }))
);

import LoadingScreen from "./components/LoadingScreen";

// Import responsive cursor system wrappers
import { MagneticCursor } from "./components/MagneticCursor";
import { TidalWaveCursor } from "./components/TidalWaveCursor";
import { CustomBrutalistCursor } from "./components/CustomBrutalistCursor";
import { NeoBrutalistCursor } from "./components/NeoBrutalistCursor";
import { TubesCursor } from "./components/TubesCursor";

// Import other requested visual block components
import { MagneticText } from "./components/MagneticText";

// Resilience + UI helpers
import ErrorBoundary from "./components/ErrorBoundary";
import { LayerFallback } from "./components/LayerFallback";
import ContactSection from "./components/ContactSection";

import {
  Sparkles,
  Orbit,
  Compass,
  Radio,
  Zap
} from "lucide-react";

function SectionBoundary({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary label={label}>
      <Suspense fallback={<LayerFallback label={label} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const [activeLayer, setActiveLayer] = useState<PortfolioLayer>(PortfolioLayer.CINEMATIC_SPACE);
  const [loading, setLoading] = useState(true);

  // Auto-track scroll to synchronize control deck highlighting
  useEffect(() => {
    const sections = [
      { id: "space", val: PortfolioLayer.CINEMATIC_SPACE },
      { id: "tactile", val: PortfolioLayer.NEUMORPHISM },
      { id: "raw", val: PortfolioLayer.BRUTALISM },
      { id: "playful", val: PortfolioLayer.NEO_BRUTALISM },
      { id: "tubes", val: PortfolioLayer.EXPERIMENTAL },
    ];

    const handleScroll = () => {
      let currentSection = sections[0].val;
      let minDistance = Infinity;

      sections.forEach((sec) => {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top);
          if (distance < minDistance) {
            minDistance = distance;
            currentSection = sec.val;
          }
        }
      });

      setActiveLayer(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Soft smooth scroll to target dimensional layer block
  const handleScrollToSegment = (layerId: PortfolioLayer) => {
    const idMap: Record<PortfolioLayer, string> = {
      [PortfolioLayer.CINEMATIC_SPACE]: "space",
      [PortfolioLayer.NEUMORPHISM]: "tactile",
      [PortfolioLayer.BRUTALISM]: "raw",
      [PortfolioLayer.NEO_BRUTALISM]: "playful",
      [PortfolioLayer.EXPERIMENTAL]: "tubes",
    };

    const targetElement = document.getElementById(idMap[layerId]);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen bg-black overflow-x-hidden selection:bg-indigo-500/20 scroll-smooth">

      {/* CINEMATIC ARTISTIC LOADING SCREEN */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* FLOATING DIMENSIONAL CONTROL DECK NAV AT BOTTOM */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-3xl pointer-events-none">
        <div className="liquid-glass-strong rounded-[1.25rem] sm:rounded-full px-2 sm:px-5 py-2.5 sm:py-3 flex items-center justify-center md:justify-between shadow-2xl hover:border-white/20 transition-all gap-2 md:gap-4 flex-wrap md:flex-nowrap pointer-events-auto">

          {/* Active Label indicator */}
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping relative">
              <span className="absolute h-2.5 w-2.5 rounded-full bg-indigo-500" />
            </div>
            <div className="text-left">
              <div className="text-[9px] font-mono tracking-widest text-[#cfcfcf]/50 uppercase">
                Active Style Dimension
              </div>
              <div className="text-xs font-bold text-white tracking-tight">
                {activeLayer}
              </div>
            </div>
          </div>

          {/* Interactive tab scroll targets */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 bg-white/5 p-1 rounded-full max-w-full">
            {[
              { id: PortfolioLayer.CINEMATIC_SPACE, label: "Space", icon: Orbit },
              { id: PortfolioLayer.NEUMORPHISM, label: "Tactile", icon: Compass },
              { id: PortfolioLayer.BRUTALISM, label: "Raw", icon: Radio },
              { id: PortfolioLayer.NEO_BRUTALISM, label: "Playful", icon: Zap },
              { id: PortfolioLayer.EXPERIMENTAL, label: "Tubes", icon: Sparkles }
            ].map((tab) => {
              const active = activeLayer === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleScrollToSegment(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-white text-black font-semibold scale-102 shadow-md"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* SINGLE-PAGE SEQUENTIAL STASH OF ALL SECTIONS */}

      {/* LAYER 1: CINEMATIC SPACE */}
      <div id="space" className="relative">
        <SectionBoundary label="01 / SPACE">
          <MagneticCursor
            lerpAmount={0.08}
            cursorSize={20}
            cursorColor="white"
            blendMode="exclusion"
          >
            <SpaceLayer />
          </MagneticCursor>
        </SectionBoundary>
      </div>

      {/* LAYER 2: TACTILE NEUMORPHISM */}
      <div id="tactile" className="relative">
        <SectionBoundary label="02 / TACTILE">
          <TidalWaveCursor rippleColor="79, 70, 229">
            <NeumorphismLayer />
          </TidalWaveCursor>
        </SectionBoundary>
      </div>

      {/* LAYER 3: RAW BRUTALISM */}
      <div id="raw" className="relative">
        <SectionBoundary label="03 / RAW BRUTALISM">
          <CustomBrutalistCursor>
            <BrutalismLayer />
          </CustomBrutalistCursor>
        </SectionBoundary>
      </div>

      {/* LAYER 4: PLAYFUL NEO-BRUTALIST */}
      <div id="playful" className="relative">
        <SectionBoundary label="04 / NEO-BRUTALIST">
          <NeoBrutalistCursor>
            <div className="bg-[#FFDE03] min-h-screen">
              {/* Interactive hover decodes vector signals */}
              <div className="w-full bg-white border-b-6 border-black py-12 px-6 text-center select-none">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-left">
                    <span className="text-xs font-mono font-black uppercase text-pink-500">
                      Hover To Decode Vector Signals
                    </span>
                    <h3 className="text-2xl font-black uppercase mt-1">
                      Creative Visual Interactive Modules
                    </h3>
                  </div>

                  {/* Magnetic Interactive Text Reveal Blocks */}
                  <div className="flex gap-4">
                    <MagneticText text="DESIGN" hoverText="STUDIO" />
                    <MagneticText text="PHOTO" hoverText="SHUTTER" />
                  </div>
                </div>
              </div>
              <NeoBrutalismLayer />
            </div>
          </NeoBrutalistCursor>
        </SectionBoundary>
      </div>

      {/* LAYER 5: EXPERIMENTAL TUBES / AWWWARDS */}
      <div id="tubes" className="relative">
        <SectionBoundary label="05 / TUBES">
          <TubesCursor>
            <AwwwardsLayer />
          </TubesCursor>
        </SectionBoundary>
      </div>

      {/* ABOUT + CONTACT */}
      <ContactSection />

    </main>
  );
}