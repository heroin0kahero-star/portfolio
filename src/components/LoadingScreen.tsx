/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";

const DEFAULT_TIPS = [
  "Structuring digital interfaces with meticulous layouts...",
  "Loading premium layout grids & interactive components...",
  "Syncing tactile Neumorphic interactions...",
  "Formatting responsive Brutalist panels...",
  "Calibrating micro-interactions & kinetic behaviors...",
  "Initializing experimental interactive vector tubes...",
];

export interface LoadingScreenProps {
  onComplete?: () => void;
  tips?: string[];
  tipInterval?: number;
  autoProgressDuration?: number;
}

export default function LoadingScreen({
  onComplete,
  tips = DEFAULT_TIPS,
  tipInterval = 2800,
  autoProgressDuration = 3800,
}: LoadingScreenProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Auto incremental progress simulation
  useEffect(() => {
    let startTime = Date.now();
    const intervalTime = 30; // fast tick

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedRatio = elapsed / autoProgressDuration;
      
      if (calculatedRatio >= 1.0) {
        setProgress(100);
        clearInterval(timer);
        
        // Let it stay at 100% briefly before fading and executing callback
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800); // fade transition time
        }, 500);
      } else {
        // Curve the progress to make it feel natural (ease-out style)
        const easeRatio = 1 - Math.pow(1 - calculatedRatio, 2);
        setProgress(Math.floor(easeRatio * 100));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoProgressDuration, onComplete]);

  // Rotate tips
  useEffect(() => {
    if (tips.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, tipInterval);
    return () => clearInterval(interval);
  }, [tips, tipInterval]);

  // Terminal trailing cursor blinker
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center px-6 select-none transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1) ${
        isFading ? "opacity-0 pointer-events-none scale-102 blur-md" : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Editorial linear grid overlay */}
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.05]">
        <div className="w-[1px] bg-neutral-500 h-full ml-16" />
        <div className="w-[1px] bg-neutral-500 h-full" />
        <div className="w-[1px] bg-neutral-500 h-full mr-16" />
      </div>

      <div className="w-full max-w-xl text-center space-y-12 z-10">
        
        {/* Clean minimal indicator */}
        <div className="inline-flex items-center gap-2 border border-white/20 px-3.5 py-1.5 rounded-sm bg-white/5 font-mono text-[9px] tracking-[4px] uppercase text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-white opacity-80 animate-pulse" />
          <span>ESTABLISHING INTERACTIVE RUNTIME</span>
        </div>

        {/* Beautiful serif layout with highlighted Suman */}
        <div className="space-y-4">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl tracking-normal leading-tight text-neutral-300 font-light lowercase">
            welcome to the world <span className="block mt-4 italic text-white font-serif">
              i built / <span className="text-black bg-white px-5 py-0.5 rounded-sm font-heading font-normal italic text-4xl md:text-5xl lg:text-6xl tracking-wide select-text shadow-xl transition-all duration-300 inline-block align-middle transform -rotate-1 border border-white uppercase">SUMAN</span>
            </span>
          </h1>
        </div>

        {/* Minimal High-Contrast Loadbar */}
        <div className="w-full max-w-sm mx-auto space-y-3">
          <div className="flex justify-between items-center font-mono text-[10px] text-neutral-400 tracking-widest uppercase">
            <span>COMPILING PORTFOLIO v2</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          
          {/* Flat black-and-white minimalist bar */}
          <div className="h-2 border border-white/20 bg-neutral-950 p-[1px] rounded-none relative overflow-hidden flex items-center">
            <div 
              style={{ width: `${progress}%` }}
              className="h-full bg-white transition-all duration-100 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            />
          </div>
        </div>

        {/* Clean status details */}
        <div className="min-h-12 flex flex-col items-center justify-center space-y-1 max-w-sm mx-auto">
          <p className="font-mono text-[11px] text-neutral-400 tracking-wide text-center leading-relaxed">
            {tips[currentTipIndex]}
            <span className={`inline-block ml-1 font-bold text-white ${showCursor ? 'opacity-100' : 'opacity-0'}`}>▋</span>
          </p>
        </div>

      </div>

      {/* Modern minimal footer details */}
      <div className="absolute bottom-8 text-[9px] font-mono tracking-[4px] text-neutral-500 uppercase flex items-center gap-1.5">
        <span>CURATING EXPERIENCE</span>
        <span className="text-neutral-600">|</span>
        <span>VERSION 2.0</span>
      </div>
    </div>
  );
}
