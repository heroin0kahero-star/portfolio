/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Layers,
  HelpCircle,
  Calculator,
  CheckCircle,
  TrendingUp,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { CONTACT_EMAIL } from "../../data";

export function NeoBrutalismLayer() {
  // Service configuration calculator state
  const [needGraphics, setNeedGraphics] = useState(true);
  const [needPhoto, setNeedPhoto] = useState(false);
  const [brandingSpeed, setBrandingSpeed] = useState("Standard"); // Express vs Standard
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Instant calculated budget estimation helper
  const calculateBudget = () => {
    let total = 0;
    if (needGraphics) total += 1200;
    if (needPhoto) total += 1800;
    if (brandingSpeed === "Express First Class") total += 800;
    return total;
  };

  return (
    <section className="relative min-h-screen bg-[#FFDE03] text-black py-20 px-4 md:px-8 select-none scroll-smooth border-y-[6px] border-black">
      
      {/* Playful polka dots style underlay background */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
        backgroundImage: "radial-gradient(#000000 2px, transparent 2px)",
        backgroundSize: "24px 24px"
      }} />

      <div className="max-w-7xl mx-auto relative z-10 text-left">
        
        {/* Layer Badge Card */}
        <div className="inline-block border-4 border-black bg-white px-5 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_#000] rotate-[-1deg] mb-8">
          💥 Design Layer 04 — Neo-Brutalist Playground
        </div>

        {/* Title area */}
        <div className="mb-12">
          <h2 className="text-5xl md:text-8xl font-black tracking-tight uppercase leading-none">
            WORK TOGETHER
          </h2>
          <p className="text-xl md:text-2xl font-bold font-mono tracking-tight mt-2 bg-yellow-300 border-2 border-black p-3 inline-block shadow-[3px_3px_0px_#000]">
            Customize Your Project Specs in Real-Time & Calculate Budget Estimates!
          </p>
        </div>

        {/* Dynamic Neobrutalist Dual Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* CALCULATOR PANEL (7 cols) */}
          <div className="lg:col-span-7 bg-white border-[6px] border-black p-6 md:p-8 shadow-[8px_8px_0px_#000] rounded-none">
            <h3 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3 border-b-4 border-black pb-4 mb-6">
              <Calculator className="h-6 w-6 stroke-3" /> Select Components
            </h3>

            <div className="flex flex-col gap-6">
              
              {/* Service Toggle Option 1 */}
              <div 
                onClick={() => setNeedGraphics(!needGraphics)}
                className={`border-4 border-black p-5 cursor-pointer flex items-center justify-between transition-all select-none ${
                  needGraphics ? "bg-yellow-300 shadow-[4px_4px_0px_#000]" : "bg-white hover:bg-neutral-50"
                }`}
              >
                <div>
                  <h4 className="text-lg font-black uppercase">Graphic Identity Package</h4>
                  <p className="text-xs text-neutral-600 mt-1 font-mono uppercase font-bold">
                    Custom Packaging, Decals, and Vector System (+ $1,200)
                  </p>
                </div>
                <div className="h-7 w-7 border-4 border-black bg-white flex items-center justify-center font-bold">
                  {needGraphics ? "✓" : ""}
                </div>
              </div>

              {/* Service Toggle Option 2 */}
              <div 
                onClick={() => setNeedPhoto(!needPhoto)}
                className={`border-4 border-black p-5 cursor-pointer flex items-center justify-between transition-all select-none ${
                  needPhoto ? "bg-purple-300 shadow-[4px_4px_0px_#000]" : "bg-white hover:bg-neutral-50"
                }`}
              >
                <div>
                  <h4 className="text-lg font-black uppercase">Freelance Studio Photography</h4>
                  <p className="text-xs text-neutral-600 mt-1 font-mono uppercase font-bold">
                    Raw exposure shoots, lenses, and catalog correction (+ $1,800)
                  </p>
                </div>
                <div className="h-7 w-7 border-4 border-black bg-white flex items-center justify-center font-bold">
                  {needPhoto ? "✓" : ""}
                </div>
              </div>

              {/* Speed Choice */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider font-mono block mb-3">
                  🚀 Delivery Timeframe
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {["Standard Priority Delivery", "Express First Class"].map((sp) => {
                    const active = (sp === "Express First Class" && brandingSpeed === "Express First Class") || (sp === "Standard Priority Delivery" && brandingSpeed === "Standard");
                    return (
                      <button
                        key={sp}
                        onClick={() => setBrandingSpeed(sp === "Express First Class" ? "Express First Class" : "Standard")}
                        className={`p-4 border-4 border-black text-sm font-black uppercase text-left transition-all relative ${
                          active ? "bg-orange-300 translate-y-1 shadow-[2px_2px_0px_#000]" : "bg-white hover:bg-neutral-50 shadow-[4px_4px_0px_#000]"
                        }`}
                      >
                        {sp}
                        <span className="text-[10px] block font-normal font-mono text-neutral-600 uppercase mt-1">
                          {sp === "Express First Class" ? "7 Business days (+$800)" : "22 Business days (Included)"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Incrementor: Feedback Rounds */}
              <div className="border-4 border-black p-5 bg-orange-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-black uppercase">Include Extra Design Iteration Rounds</h4>
                  <p className="text-xs text-neutral-600 mt-1 font-mono">
                    Add standard structural revisions (+ $50 each)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setFeedbackCount(Math.max(0, feedbackCount - 1))}
                    className="h-10 w-10 border-4 border-black bg-white font-black text-lg flex items-center justify-center active:bg-orange-200"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-xl w-8 text-center">{feedbackCount}</span>
                  <button 
                    onClick={() => setFeedbackCount(feedbackCount + 1)}
                    className="h-10 w-10 border-4 border-black bg-white font-black text-lg flex items-center justify-center active:bg-orange-200"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* BUDGET CALCULATION OUTPUT & CTA (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-6">
            
            {/* Display Box */}
            <div className="bg-yellow-400 border-[6px] border-black p-6 md:p-8 shadow-[8px_8px_0px_#000] rotate-[0.5deg]">
              <span className="text-xs font-bold uppercase tracking-wider font-mono block mb-2 text-neutral-800">
                [LIVE ESTIMATE OVERVIEW]
              </span>
              
              <div className="flex justify-between items-baseline border-b-4 border-black pb-4 mb-4">
                <span className="text-lg font-black uppercase">Total Projected</span>
                <span className="text-4xl md:text-5xl font-black font-sans bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#000]">
                  ${calculateBudget() + feedbackCount * 50}
                </span>
              </div>

              {/* Breakdown */}
              <ul className="text-xs font-mono flex flex-col gap-2 bg-white/60 p-4 border-2 border-black text-left mb-6 font-semibold">
                {needGraphics && <li>✓ BRANDING PACKAGE: $1,200</li>}
                {needPhoto && <li>✓ PHOTOGRAPHY SHOT: $1,800</li>}
                {brandingSpeed === "Express First Class" && <li>✓ EXPRESS DISPATCH: $800</li>}
                {feedbackCount > 0 && <li>✓ REVISION RUNS ({feedbackCount}): ${feedbackCount * 50}</li>}
                {!needGraphics && !needPhoto && <li className="text-red-500 animate-pulse">※ SELECT COMPONENTS TO ACTIVATE CALCULATION</li>}
              </ul>

              {isSubmitted ? (
                <div className="bg-lime-400 border-4 border-black p-4 font-black uppercase text-center text-sm shadow-[4px_4px_0px_#000] my-2 animate-bounce">
                  🎉 SPECIFICATION SUBMITTED! BUDGET: ${calculateBudget() + feedbackCount * 50}
                </div>
              ) : (
                <button 
                  className="w-full py-4 neo-brutal-btn text-white hover:opacity-90 hover:scale-[1.01] transition-all text-lg font-black uppercase tracking-wide flex items-center justify-center gap-3 active:translate-y-1 cursor-pointer"
                  onClick={() => {
                    setIsSubmitted(true);
                    setTimeout(() => setIsSubmitted(false), 5000);
                    const total = calculateBudget() + feedbackCount * 50;
                    const components = [
                      needGraphics ? "Graphic Identity Package" : "",
                      needPhoto ? "Freelance Studio Photography" : "",
                      brandingSpeed === "Express First Class" ? "Express Priority Delivery" : "",
                      feedbackCount > 0 ? `${feedbackCount} extra revision round(s)` : "",
                    ].filter(Boolean).join(", ");
                    const subject = encodeURIComponent(`Project Request from portfolio — Estimated $${total}`);
                    const body = encodeURIComponent(
                      `Hi Suman,\n\nI'd like to discuss a project.\n\nSelected components: ${components || "To be discussed"}\nEstimated budget: $${total}\n\nPlease reach back to me at:`
                    );
                    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
                  }}
                >
                  Launch This Request <Sparkles className="h-5 w-5 fill-current" />
                </button>
              )}
            </div>

            {/* Playful Stamp Sticker */}
            <div className="border-4 border-black bg-pink-300 p-5 shadow-[4px_4px_0px_#000] -rotate-2 flex items-start gap-3">
              <MessageSquare className="h-6 w-6 stroke-2 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black uppercase">100% Transparent Billing</h4>
                <p className="text-xs mt-1 leading-snug">
                  No hidden margins. You configure what you active, and we ship within the specified prioritary windows. Simple!
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
