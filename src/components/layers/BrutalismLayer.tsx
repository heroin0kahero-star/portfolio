/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { PORTFOLIO_PROJECTS } from "../../data";
import { Shield, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export function BrutalismLayer() {
  const webProjects = PORTFOLIO_PROJECTS.filter(p => p.category === "web");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  return (
    <section className="relative min-h-screen bg-neutral-950 text-white py-24 select-none border-t-[8px] border-black overflow-hidden font-mono z-0">
      
      {/* Background brutal lines */}
      <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-r border-white h-full" />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Giant Header Block */}
        <div className="border-[6px] border-white p-6 md:p-12 text-left bg-neutral-950 shadow-[10px_10px_0px_#fff] relative overflow-hidden">
          <div className="absolute top-2 right-2 text-xs uppercase bg-white text-black px-2 py-0.5 font-bold tracking-tight">
            DEPT_03 / RAW
          </div>
          
          <span className="text-sm font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            [STYLE_INDEX_03: RAW BRUTALISM]
          </span>
          <h2 className="font-heading italic text-6xl md:text-8xl leading-none text-white tracking-[-3px] uppercase font-black uppercase">
            GRAPHIC INDEX CHRONICLE
          </h2>
          <p className="mt-4 text-xs md:text-sm text-neutral-300 max-w-2xl leading-relaxed uppercase">
            WE IGNORE COOKIE-CUTTER MARGINS AND SACRIFICE DECORATION FOR RAW STRUCTURAL DYNAMICS. EXPERIMENTAL WEB LAYOUTS AND COMPOSITIONS DEVELOPED FOR REAL CLIENTS AND BRANDS.
          </p>
        </div>

        {/* Strange Interactive Offset layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16 items-start">
          
          {/* POSTERS ARCHIVE SECTION (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white text-black py-1 px-4 text-xs font-black tracking-widest text-left font-mono">
              [PRINT RECORD LOGS]
            </div>

            {webProjects.map((p, idx) => (
              <div
                key={p.id}
                onMouseEnter={() => {
                  setHoverIndex(idx);
                  setFlashOn(true);
                  setTimeout(() => setFlashOn(false), 120);
                }}
                onMouseLeave={() => setHoverIndex(null)}
                className={`border-4 p-5 text-left transition-all relative group cursor-pointer ${
                  hoverIndex === idx
                    ? "bg-white text-black border-yellow-300 translate-x-2 -translate-y-1 shadow-[-8px_8px_0px_#facc15]"
                    : "bg-neutral-900 text-white border-neutral-800 hover:border-white"
                }`}
              >
                {/* Weird catalog indexes */}
                <div className="absolute top-4 right-4 text-xs font-bold font-mono text-neutral-500 group-hover:text-black">
                  [CD_{p.year}_{idx}]
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-3xl font-black font-sans leading-none">
                    0{idx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 font-semibold block">
                      Client: {p.client} — {p.role}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black font-sans tracking-tight uppercase mt-1 leading-none">
                      {p.title}
                    </h3>
                    <p className="text-xs mt-2 text-neutral-400 group-hover:text-neutral-800 leading-normal font-mono max-w-xl">
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Tags block in brutalist box */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {p.tags.map(t => (
                    <span 
                      key={t}
                      className={`text-[9px] px-2 py-0.5 font-bold uppercase border ${
                        hoverIndex === idx ? "border-black bg-neutral-100" : "border-neutral-700 bg-neutral-950 text-neutral-400"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE: EXPERIMENTAL PREVIEW WINDOW (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            
            {/* Visual Screen */}
            <div className={`border-4 border-white bg-neutral-950 p-4 transition-all relative ${
              flashOn ? "bg-white" : ""
            }`}>
              {/* Screen grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />

              <div className="absolute top-2 left-2 z-20 bg-black text-white py-0.5 px-2 text-[10px] font-bold uppercase border border-neutral-700">
                LIVESTREAM_MONITOR.C
              </div>

              {/* Photo Projection container */}
              <div className="h-[380px] bg-neutral-900 overflow-hidden relative border-2 border-neutral-800 flex items-center justify-center">
                {hoverIndex !== null ? (
                  <img
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    src={webProjects[hoverIndex].imageUrl}
                    alt={`${webProjects[hoverIndex].title} — website screenshot`}
                    className="w-full h-full object-cover transition-transform duration-300 scale-105 filter saturate-150 contrast-125 brightness-95"
                  />
                ) : (
                  <div className="p-8 text-center uppercase flex flex-col items-center gap-3">
                    <AlertCircle className="h-10 w-10 text-neutral-600 animate-pulse" />
                    <span className="text-neutral-500 font-bold text-xs tracking-widest mt-2 block">
                      NO ACTIVE COMPOSITION SIGNAL / HOVER INDEX TARGET TO ENGAGE OUTPUT
                    </span>
                  </div>
                )}
                
                {/* Visual glitches */}
                {flashOn && (
                  <div className="absolute inset-0 bg-white z-30 opacity-70 animate-ping" />
                )}
              </div>

              {/* Monitor Footer */}
              <div className="mt-4 flex items-center justify-between text-neutral-400 text-[10px] font-bold font-mono">
                <span>COORD: X=354.2 · Y=892.1</span>
                <span className="flex items-center gap-1.5 animate-pulse text-red-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> LIVE STREAMING
                </span>
              </div>
            </div>

            {/* Sub decoration block */}
            <div className="border-4 border-dashed border-neutral-700 p-6 mt-6 text-left flex items-start gap-4 bg-neutral-950">
              <Shield className="h-8 w-8 text-neutral-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-black uppercase text-white">SYSTEM INTEGRITY SECURE</h4>
                <p className="text-[10px] text-neutral-400 uppercase leading-normal mt-1">
                  ALL MEDIA GENERATED UNDER STRICT STANDARD LAYOUT CONVENTIONS. NO GRADIENTS ALLOWED. REAL HIGH-CONTRAST MONOSPACED LOGS ONLY.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
