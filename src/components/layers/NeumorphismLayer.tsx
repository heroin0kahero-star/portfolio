/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { PORTFOLIO_PROJECTS } from "../../data";
import { Sliders, Eye, Heart, Camera, Aperture, ZoomIn, Layers } from "lucide-react";
import SocialCards from "../SocialCards";

const SOCIAL_FAN_CARDS_DATA = [
  { imgUrl: "/images/projects/suman-project-card.jpg", alt: "Suman Project website", linkUrl: "https://suman-project.vercel.app/" },
  { imgUrl: "/images/projects/kites-sports-foundation.svg", alt: "Kites Sports Foundation website", linkUrl: "https://www.kitessportsfoundation.in/" },
  { imgUrl: "/images/projects/play-365-titanfa.svg", alt: "Play 365 Titan Football Academy website", linkUrl: "https://www.play365titanfa.in/" },
  { imgUrl: "/images/projects/kites-sports-foundation.svg", alt: "Kites Sports Foundation website — orange hero", linkUrl: "https://www.kitessportsfoundation.in/" },
  { imgUrl: "/images/projects/suman-project-card.jpg", alt: "Suman Project — interactive interface", linkUrl: "https://suman-project.vercel.app/" },
  { imgUrl: "/images/projects/play-365-titanfa.svg", alt: "Play 365 Titan FA — fixtures & academy news", linkUrl: "https://www.play365titanfa.in/" },
  { imgUrl: "/images/projects/suman-project-card.jpg", alt: "Suman Project — live demo", linkUrl: "https://suman-project.vercel.app/" }
];

export function NeumorphismLayer() {
  const webProjects = PORTFOLIO_PROJECTS.filter(p => p.category === "web");
  const [selectedProj, setSelectedProj] = useState(webProjects[0]);
  
  // Custom interactive photo values
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Soft shadows styling variables helper
  const neuOutset = {
    boxShadow: "8px 8px 16px #bcbfc4, -8px -8px 16px #ffffff"
  };
  const neuInset = {
    boxShadow: "inset 4px 4px 10px #bcbfc4, inset -4px -4px 10px #ffffff"
  };
  const neuButtonActive = {
    boxShadow: "inset 2px 2px 5px #bcbfc4, inset -2px -2px 5px #ffffff"
  };

  return (
    <section className="relative min-h-screen bg-[#E0E5EC] text-slate-700 py-20 px-4 md:px-12 select-none scroll-smooth">
      <div className="max-w-7xl mx-auto">
        
        {/* Layer Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold bg-neutral-300/30 px-3 py-1 rounded-full border border-white/20">
            Design Layer 02 — Tactile Neumorphism
          </span>
          <h2 className="mt-4 font-heading text-6xl md:text-7xl italic leading-none text-neutral-800 font-light tracking-tight">
            Client Interactive darkroom
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-500 font-body max-w-xl mx-auto font-light">
            An analog digital tactile desk for adjusting high-fidelity filters and viewing real client website builds.
          </p>
        </div>

        {/* Dashboard Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mt-12">
          
          {/* LEFT PANEL: PHOTO SELECTION DECK (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase text-left mb-1">
              Select Client Build
            </h3>

            {webProjects.map((p) => {
              const isActive = selectedProj.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProj(p);
                    setIsLiked(false);
                  }}
                  style={isActive ? neuInset : neuOutset}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 text-left border border-white/30 ${
                    isActive ? "bg-[#e0e0e0] opacity-95" : "bg-[#e0e0e0] hover:scale-[1.01]"
                  }`}
                >
                  <div 
                    style={isActive ? neuButtonActive : neuOutset}
                    className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/40 flex items-center justify-center p-0.5"
                  >
                    <img 
                      referrerPolicy="no-referrer"
                      src={p.thumbnailUrl ?? p.imageUrl} 
                      alt={p.title} 
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-semibold text-neutral-400 font-mono">
                      {p.year} / {p.client}
                    </span>
                    <h4 className="font-heading italic text-xl text-neutral-800 truncate">
                      {p.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap block mt-0.5">
                      {p.tags.join(" · ")}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* QUICK HARDWARE TOGGLE APERTURE DECK */}
            <div 
              style={neuOutset} 
              className="bg-[#e0e0e0] rounded-3xl p-6 text-left border border-white/30 mt-4"
            >
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Camera className="h-4 w-4" /> Aperture Speed
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {["f/1.4", "f/2.8", "f/8.0"].map((ap, idx) => (
                  <button
                    key={ap}
                    style={idx === 1 ? neuInset : neuOutset}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl text-neutral-700 active:scale-95 transition-all ${
                      idx === 1 ? "bg-[#e0e0e0] text-indigo-600 font-bold" : "bg-[#e0e0e0]"
                    }`}
                  >
                    {ap}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CENTER: PHOTOGRAPHY VIEWPORT (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div 
              style={neuOutset}
              className="bg-[#e0e0e0] rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-white/30 flex-1"
            >
              
              {/* Photo Frame Container (Inset shadow creates the darkroom window) */}
              <div 
                style={neuInset}
                className="bg-[#dcdcdc] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group"
              >
                
                {/* Simulated Lens Aperture ring overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-[10px] bg-[#e0e0e0]/90 text-neutral-600 px-3 py-1 rounded-full shadow-sm font-mono font-medium flex items-center gap-1.5 border border-white/50">
                    <Aperture className="h-3 w-3 shrink-0 text-indigo-500 animate-spin-slow" /> Ambient Exposure
                  </span>
                </div>

                <div className="w-full h-[320px] md:h-[400px] rounded-xl overflow-hidden relative shadow-inner">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedProj.imageUrl}
                    alt={selectedProj.title}
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`,
                      transition: "filter 0.15s ease"
                    }}
                    className="w-full h-full object-cover select-none pointer-events-none rounded-xl"
                  />
                  
                  {/* Photo details bottom bar overlay */}
                  <div className="absolute bottom-4 inset-x-4 bg-black/40 backdrop-blur-md rounded-xl p-3 text-left flex justify-between items-center text-white border border-white/10 shadow-lg">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-white/70 uppercase">
                        Active Master Glass
                      </span>
                      <h4 className="font-heading italic text-xl leading-none mt-1">
                        {selectedProj.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-200">
                      ISO 400 · 35mm
                    </span>
                  </div>
                </div>
              </div>

              {/* TACTILE DESK CONTROLS GROUP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                
                {/* Interactive Sliders column */}
                <div className="flex flex-col gap-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" /> Adjust Master Values
                  </span>

                  {/* Brightness slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-neutral-600 mb-1">
                      <span>Light Levels (Brightness)</span>
                      <span>{brightness}%</span>
                    </div>
                    <div style={neuInset} className="h-3 w-full rounded-full relative flex items-center px-1">
                      <input 
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        style={{ width: `${((brightness - 50) / 100) * 100}%` }}
                        className="bg-indigo-500 h-1.5 rounded-full"
                      />
                      <div 
                        style={{ 
                          left: `calc(${((brightness - 50) / 100) * 100}% - 8px)`
                        }}
                        className="absolute h-4 w-4 rounded-full bg-[#ededed] border border-white/80 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Contrast slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-neutral-600 mb-1">
                      <span>Saturate (Contrast Ratio)</span>
                      <span>{contrast}%</span>
                    </div>
                    <div style={neuInset} className="h-3 w-full rounded-full relative flex items-center px-1">
                      <input 
                        type="range"
                        min="50"
                        max="150"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        style={{ width: `${((contrast - 50) / 100) * 100}%` }}
                        className="bg-purple-500 h-1.5 rounded-full"
                      />
                      <div 
                        style={{ 
                          left: `calc(${((contrast - 50) / 100) * 100}% - 8px)`
                        }}
                        className="absolute h-4 w-4 rounded-full bg-[#ededed] border border-white/80 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tactile Action Switches column */}
                <div className="flex flex-col justify-between text-left">
                  
                  {/* Filters Selector */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Analog Filters
                    </span>
                    <div className="flex gap-2.5 mt-2.5">
                      <button
                        onClick={() => setGrayscale(0)}
                        style={grayscale === 0 ? neuInset : neuOutset}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl text-neutral-700 active:scale-95 transition-all ${
                          grayscale === 0 ? "bg-[#e0e0e0] text-indigo-600 font-bold" : "bg-[#e0e0e0]"
                        }`}
                      >
                        Chroma
                      </button>
                      <button
                        onClick={() => setGrayscale(100)}
                        style={grayscale === 100 ? neuInset : neuOutset}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl text-neutral-700 active:scale-95 transition-all ${
                          grayscale === 100 ? "bg-[#e0e0e0] text-indigo-600 font-bold" : "bg-[#e0e0e0]"
                        }`}
                      >
                        Monochrome
                      </button>
                    </div>
                  </div>

                  {/* Buttons group */}
                  <div className="flex items-center gap-4 mt-6">
                    {/* Share / Eye */}
                    <button 
                      style={neuOutset}
                      className="px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600 flex items-center gap-2 active:scale-95 transition-all hover:bg-[#ededed] bg-[#e0e0e0] border border-white/30"
                    >
                      <Eye className="h-4 w-4 text-neutral-500" /> Full Specs
                    </button>

                    {/* Like switch */}
                    <button 
                      onClick={() => setIsLiked(!isLiked)}
                      style={isLiked ? neuInset : neuOutset}
                      className={`h-11 w-11 rounded-full flex items-center justify-center active:scale-95 transition-all border border-white/30 ${
                        isLiked ? "bg-[#e0e0e0] text-[#f5365c]" : "bg-[#e0e0e0] text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                  </div>

                </div>

              </div>
              
            </div>
          </div>

        </div>

        {/* NEUMORPHIC KINETIC SOCIAL DECK - DESIGN LAYER FEATURES */}
        <div className="mt-24 border-t border-white/20 pt-16">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[3px] text-neutral-400 font-bold bg-neutral-300/30 px-3 py-1 rounded-full border border-white/20">
              EXPLORE TACTILE GALLERY DECK
            </span>
            <h3 className="mt-3 font-heading text-4xl italic text-neutral-800 font-light tracking-tight flex items-center justify-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500 shrink-0" /> Interactive Cover Fan
            </h3>
            <p className="mt-2 text-xs text-slate-500 font-body max-w-md mx-auto leading-relaxed">
              Hover, click or paginate through high-contrast premium photographic works. Experience 1:1 tactile depth feedback on cursor focus.
            </p>
          </div>

          <div 
            style={neuOutset}
            className="bg-[#e0e0e0] rounded-[2.5rem] p-6 md:p-12 border border-white/40 shadow-xl"
          >
            <SocialCards cards={SOCIAL_FAN_CARDS_DATA} />
          </div>
        </div>

      </div>
    </section>
  );
}
