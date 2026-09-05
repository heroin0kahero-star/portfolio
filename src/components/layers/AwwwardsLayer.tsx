/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { PORTFOLIO_PROJECTS } from "../../data";
import { Sparkles, Info, ArrowUpRight, Cpu } from "lucide-react";

export function AwwwardsLayer() {
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = PORTFOLIO_PROJECTS.length;

  const currentProj = PORTFOLIO_PROJECTS[activeSlide];

  return (
    <section className="relative min-h-screen bg-black text-white py-24 select-none scroll-smooth flex flex-col justify-between overflow-hidden Z-0">
      
      {/* Decorative vertical lines */}
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
        <div className="w-[1px] bg-neutral-800 h-full ml-12" />
        <div className="w-[1px] bg-neutral-800 h-full" />
        <div className="w-[1px] bg-neutral-800 h-full mr-12" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex-1 flex flex-col justify-between gap-12">
        
        {/* Cinematic Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] tracking-[4px] text-neutral-500 uppercase font-mono flex items-center gap-2">
              <Cpu className="h-3 w-3 text-indigo-500 animate-pulse animate-spin-slow" /> [SECTION / 05]
            </span>
            <h3 className="text-sm font-sans tracking-tight text-neutral-400 font-light mt-1 text-left">
              Websites as Sculpture — Interfaces / Volumetrical Studies
            </h3>
          </div>
          
          <div className="border border-neutral-800 p-1 px-3 rounded-full text-[10px] font-mono hover:bg-neutral-900 cursor-pointer transition-colors">
            WEB DEVELOPMENT SHOWCASE — 5 LAYERS
          </div>
        </div>

        {/* Dynamic Massive Interactive Slider Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
          
          {/* LEFT CHROME DESCRIPTOR PANEL (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left gap-6 z-10 justify-center">
            
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
              <span>EXPLORE ARCHIVE</span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>{activeSlide + 1} OF {totalSlides}</span>
            </div>

            <div>
              <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-semibold">
                — {currentProj.client}
              </h4>
              <h2 className="font-heading italic text-5xl md:text-7xl leading-none tracking-[-2px] text-white mt-2">
                {currentProj.title}
              </h2>
              <span className="text-[11px] font-mono bg-neutral-950 border border-neutral-900 text-neutral-400 rounded-full px-3 py-1 inline-block mt-3 uppercase tracking-wider">
                {currentProj.role || "Web Developer"}
              </span>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed font-body font-light max-w-sm">
              {currentProj.description}
            </p>

            {/* Slide Indicators Navigation (Pills) */}
            <div className="flex items-center gap-2 mt-2">
              {PORTFOLIO_PROJECTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === i ? "w-8 bg-white" : "w-2.5 bg-neutral-800 hover:bg-neutral-600"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button 
              className="mt-4 flex items-center gap-2.5 text-xs uppercase tracking-widest text-indigo-400 hover:text-white font-mono active:scale-95 transition-all group"
              onClick={() => setActiveSlide((activeSlide + 1) % totalSlides)}
            >
              <span>INSPECT SEQUENTIAL NODAL PLACEMENTS</span>
              <ArrowUpRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>

          </div>

          {/* MAIN INTERACTIVE PHOTO RIFT (7 cols) */}
          <div className="lg:col-span-7 flex justify-center w-full relative">
            
            {/* Holographic Projection Card Frame */}
            <div className="relative w-full max-w-[500px] aspect-[4/5] bg-neutral-950 border border-neutral-800 p-4 rounded-none hover:border-neutral-500 hover:shadow-indigo-500/5 transition-all group overflow-hidden">
              <div className="absolute inset-0 bg-neutral-900/10 pointer-events-none group-hover:opacity-0 transition-opacity z-10" />

              {/* Hologram scans lines overlay */}
              <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500/30 blur-[2px] animate-scan z-20 pointer-events-none" />

              <div className="w-full h-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                <img
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  src={currentProj.imageUrl}
                  alt={`${currentProj.title} — website screenshot`}
                  className="w-full h-full object-cover select-none pointer-events-none scale-100 group-hover:scale-105 transition-all duration-[800ms] filter grayscale select-none"
                />
                
                {/* Visual displacement indicator */}
                <div className="absolute right-4 bottom-4 z-20 h-8 w-8 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer active:scale-90 transition-all opacity-0 group-hover:opacity-100 duration-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                </div>
              </div>

              {/* Coordinates indicators */}
              <div className="absolute bottom-2 left-6 text-[8px] font-mono text-neutral-600 uppercase tracking-widest opacity-80 z-20">
                DISPLACEMENT SYSTEM ENABLED / SCALE: 1.05x / GRID_ACTIVE
              </div>
            </div>

            {/* Huge display background serif letter under the main projection card */}
            <div className="absolute -bottom-12 -right-12 z-0 font-heading italic text-[16rem] leading-none text-neutral-950 opacity-40 select-none pointer-events-none">
              A
            </div>

          </div>

        </div>

        {/* Fine-art footer logs info */}
        <div className="border-t border-neutral-900 pt-8 mt-12 flex flex-col md:flex-row justify-between items-start md:items-center text-neutral-500 text-[10px] font-mono gap-4 uppercase select-none text-left">
          <span>BUILT BY SUMAN © 2026</span>
          <span className="max-w-md">
            The Tubes interactions are active globally. Clicking inside the canvas triggers three-dimensional color changes dynamically across WebGL vector meshes.
          </span>
          <span>FPS SYSTEM: 60 / STEREO=NORMAL</span>
        </div>

      </div>

    </section>
  );
}
