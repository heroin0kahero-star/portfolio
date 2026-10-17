/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sparkles,
  Calculator,
  CheckCircle,
  MessageSquare,
  Rocket,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { CONTACT_EMAIL } from "../../data";

type TierId = "landing" | "starter" | "growth" | "custom";
type DesignLevel = "Simple" | "Standard" | "Custom" | "Premium";
type FeatureId = "booking" | "cms" | "ecom" | "seo" | "photo" | "care";
type DeliveryChoice = "Standard" | "Express";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

interface TierConfig {
  id: TierId;
  name: string;
  rangeLow: number;
  rangeLabel: string;
  pages: number;
  fixedPages?: boolean;
  design: DesignLevel;
  features: FeatureId[];
  blurb: string;
  included: string[];
}

const TIERS: TierConfig[] = [
  {
    id: "landing",
    name: "Landing Page",
    rangeLow: 17000,
    rangeLabel: "₹17,000 – ₹25,000",
    pages: 1,
    fixedPages: true,
    design: "Standard",
    features: [],
    blurb: "A single high-converting page built to capture leads fast.",
    included: ["Single page — hero + CTA", "Mobile-responsive", "Contact form", "Fast turnaround"],
  },
  {
    id: "starter",
    name: "Starter Site",
    rangeLow: 28000,
    rangeLabel: "₹28,000 – ₹35,000",
    pages: 4,
    design: "Standard",
    features: [],
    blurb: "A clean, quick launch for a single service or business.",
    included: ["Up to 4 pages", "Mobile-responsive", "Standard design", "Contact form"],
  },
  {
    id: "growth",
    name: "Growth Site",
    rangeLow: 50000,
    rangeLabel: "₹50,000 – ₹65,000",
    pages: 8,
    design: "Custom",
    features: ["booking", "cms"],
    blurb: "Booking-first build for appointment-driven businesses.",
    included: ["Up to 8 pages", "Booking/appointment integration", "Custom design", "Basic CMS"],
  },
  {
    id: "custom",
    name: "Custom Build",
    rangeLow: 80000,
    rangeLabel: "₹80,000 and above",
    pages: 10,
    design: "Custom",
    features: ["cms"],
    blurb: "A fully bespoke platform with industry-specific features.",
    included: ["10+ pages", "Fully custom design", "CMS + e-commerce/booking as needed", "Industry-specific features"],
  },
];

const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t])) as Record<TierId, TierConfig>;

const FEATURES: Record<FeatureId, { label: string; fee: number; recurring?: boolean }> = {
  booking: { label: "Booking/Appointment System", fee: 8000 },
  cms: { label: "CMS (content editing)", fee: 6000 },
  ecom: { label: "E-commerce", fee: 15000 },
  seo: { label: "SEO setup", fee: 4000 },
  photo: { label: "Photography add-on", fee: 10000 },
  care: { label: "Monthly care plan", fee: 2000, recurring: true },
};

const FEATURE_IDS = Object.keys(FEATURES) as FeatureId[];

const DESIGN_LEVELS: DesignLevel[] = ["Simple", "Standard", "Custom", "Premium"];
const DESIGN_FEES: Record<DesignLevel, number> = {
  Simple: 0,
  Standard: 0,
  Custom: 10000,
  Premium: 20000,
};

const PAGE_FEE = 2000;
const EXPRESS_FEE = 8000;
const CARE_FEE = FEATURES.care.fee;

const INDUSTRIES = ["Healthcare", "Wellness", "Education", "Fitness", "Other"];

const COUNT_DOWN_STANDARD = "10–14 Business days";
const COUNT_DOWN_EXPRESS = "5–7 Business days";

function selectTierDefaults(tierId: TierId) {
  const tier = TIER_BY_ID[tierId];
  return {
    tier,
    pages: tier.pages,
    design: tier.design,
    features: Object.fromEntries(FEATURE_IDS.map((id) => [id, tier.features.includes(id)])) as Record<FeatureId, boolean>,
    delivery: "Standard" as DeliveryChoice,
    industry: "Other",
  };
}

export function NeoBrutalismLayer() {
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [pagesStep, setPagesStep] = useState<number>(4);
  const [designStep, setDesignStep] = useState<number>(1);
  const [featuresState, setFeaturesState] = useState<Record<FeatureId, boolean>>(
    Object.fromEntries(FEATURE_IDS.map((id) => [id, false])) as Record<FeatureId, boolean>
  );
  const [delivery, setDelivery] = useState<DeliveryChoice>("Standard");
  const [industry, setIndustry] = useState<string>("Other");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const applyTier = (tierId: TierId) => {
    const d = selectTierDefaults(tierId);
    setSelectedTier(tierId);
    setPagesStep(d.pages);
    setDesignStep(DESIGN_LEVELS.indexOf(d.design));
    setFeaturesState(d.features);
    setDelivery(d.delivery);
    setIndustry(d.industry);
    setIsSubmitted(false);
  };

  const tier = selectedTier ? TIER_BY_ID[selectedTier] : null;
  const design = DESIGN_LEVELS[designStep];
  const customizing = selectedTier !== null;

  // Instant calculated budget estimation helper
  const calc = () => {
    if (!tier) return { oneTime: 0, monthly: 0 };
    const tierDesignFee = DESIGN_FEES[tier.design];
    const extraPages = Math.max(0, pagesStep - tier.pages);
    const designUpcharge = Math.max(0, DESIGN_FEES[design] - tierDesignFee);
    const featureTotal = FEATURE_IDS.reduce((sum, id) => {
      if (featuresState[id] && !tier.features.includes(id)) sum += FEATURES[id].fee;
      return sum;
    }, 0);
    const expressFee = delivery === "Express" ? EXPRESS_FEE : 0;
    const oneTime = tier.rangeLow + extraPages * PAGE_FEE + designUpcharge + featureTotal + expressFee;
    const monthly = featuresState.care ? CARE_FEE : 0;
    return { oneTime, monthly, extraPages, designUpcharge, featureTotal, expressFee };
  };

  const lineItems = () => {
    if (!tier) return { items: [], oneTime: 0, monthly: 0 };
    const { oneTime, monthly, extraPages, designUpcharge, featureTotal, expressFee } = calc();
    const items: { text: string; recurring?: boolean }[] = [
      { text: `${tier.name.toUpperCase()} BASE — ${inr(tier.rangeLow)} (EST.)` },
    ];
    if (extraPages > 0) {
      items.push({ text: `${pagesStep} PAGES (+${extraPages} BEYOND ${tier.pages}) — ${inr(extraPages * PAGE_FEE)}` });
    }
    if (designUpcharge > 0) {
      items.push({ text: `DESIGN: ${design.toUpperCase()} — ${inr(designUpcharge)}` });
    }
    FEATURE_IDS.forEach((id) => {
      if (!featuresState[id]) return;
      if (tier.features.includes(id)) {
        items.push({ text: `${FEATURES[id].label.toUpperCase()} — INCLUDED IN ${tier.name.toUpperCase()}` });
      } else {
        const fee = FEATURES[id].fee;
        items.push({ text: `${FEATURES[id].label.toUpperCase()} — ${inr(fee)}${FEATURES[id].recurring ? "/MONTH" : ""}`, recurring: FEATURES[id].recurring });
      }
    });
    if (expressFee > 0) {
      items.push({ text: `EXPRESS DELIVERY (${COUNT_DOWN_EXPRESS}) — ${inr(expressFee)}` });
    }
    if (featureTotal === 0 && extraPages === 0 && designUpcharge === 0 && expressFee === 0) {
      items.push({ text: "STANDARD CONFIG — NOTHING ABOVE BASE" });
    }
    return { items, oneTime, monthly };
  };

  const { items, oneTime, monthly } = lineItems();

  const toggleFeature = (id: FeatureId) => {
    setFeaturesState((f) => ({ ...f, [id]: !f[id] }));
  };

  const resetToTierDefaults = () => {
    if (selectedTier) applyTier(selectedTier);
  };

  const submitRequest = () => {
    const body = buildRequestBody();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    const subject = encodeURIComponent(`Project Request from portfolio — Estimated ${inr(oneTime)}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  const buildRequestBody = () => {
    if (!tier) return "";
    const selectedFeatures = FEATURE_IDS.filter((id) => featuresState[id]);
    const base = [
      `Hi Suman,`,
      ``,
      `I'd like to discuss a project.`,
      ``,
      `Package: ${tier.name} (est. ${tier.rangeLabel})`,
      `Industry vertical: ${industry}`,
      tier.fixedPages
        ? `Number of pages: 1 (fixed single-page scope)`
        : `Number of pages: ${pagesStep} (${tier.pages} included with ${tier.name})`,
      `Design complexity: ${design}`,
      `Delivery: ${delivery === "Express" ? `Express (${COUNT_DOWN_EXPRESS}, +${inr(EXPRESS_FEE)} est.)` : `Standard (${COUNT_DOWN_STANDARD}, included)`}`,
      `Features: ${selectedFeatures.length ? selectedFeatures.map((id) => `${FEATURES[id].label}${tier.features.includes(id) ? " (included)" : ` (+${inr(FEATURES[id].fee)}${FEATURES[id].recurring ? "/month" : ""} est.)`}`).join("; ") : "None selected"}`,
    ];
    return base.join("\n") + `\n\nEstimated one-time budget: ${inr(oneTime)}` + (monthly > 0 ? `\nRecurring: ${inr(monthly)}/month` : "") + `\n\nAll figures are estimates — final quote confirmed after a quick scope call.` + `\n\nPlease reach back to me at:`;
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
            Pick a Package or Customize in Real-Time — Transparent INR Estimates!
          </p>
        </div>

        {/* SECTION A: PRESET PACKAGE CARDS */}
        <div className="mb-10">
          <div className="inline-block border-4 border-black bg-black text-white px-4 py-1.5 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,0.35)] mb-5">
            Step 1 — Pick Your Package
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {TIERS.map((t) => {
              const active = selectedTier === t.id;
              return (
                <div
                  key={t.id}
                  className={`relative flex flex-col border-4 border-black bg-white p-6 transition-all flex-1 ${
                    active
                      ? "bg-yellow-300 translate-x-1 translate-y-1 shadow-[4px_4px_0px_#000]"
                      : "shadow-[8px_8px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[6px_6px_0px_#000]"
                  }`}
                >
                  {active && (
                    <div className="absolute -top-3 -right-3 border-4 border-black bg-black text-white text-[10px] font-black uppercase px-3 py-1 rotate-3">
                      Selected ✓
                    </div>
                  )}
                  <h3 className="text-2xl font-black uppercase tracking-tight">{t.name}</h3>
                  <p className="text-[10px] font-mono uppercase text-neutral-500 mt-1 font-bold">{`[PACKAGE_${t.id.toUpperCase()}]`}</p>
                  <p className="text-xs text-neutral-600 mt-3 leading-snug font-body">{t.blurb}</p>

                  <div className="mt-4 font-mono">
                    <span className="text-[10px] font-black uppercase text-neutral-500 block">
                      Estimated Range
                    </span>
                    <span className="text-3xl md:text-4xl font-black tracking-tighter block mt-1">
                      {t.rangeLabel}
                    </span>
                    <span className="text-sm font-bold text-neutral-500 block mt-1">ONE-TIME PROJECT ESTIMATE</span>
                  </div>

                  <ul className="mt-5 flex flex-col gap-2 text-xs font-bold uppercase font-mono flex-1">
                    {t.included.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="text-green-600 font-black leading-none">✓</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => applyTier(t.id)}
                    className={`mt-6 w-full py-3.5 border-4 border-black text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:translate-y-0.5 cursor-pointer ${
                      active
                        ? "bg-black text-white shadow-[2px_2px_0px_#000]"
                        : "bg-[#F27D26] shadow-[4px_4px_0px_#000] hover:bg-orange-400"
                    }`}
                  >
                    {active ? <CheckCircle className="h-4 w-4" /> : null}
                    {active ? "Package Selected" : "Select This Package"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Standalone customize link */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-neutral-700">
              Want a different mix?
            </span>
            <button
              onClick={() => applyTier("starter")}
              className="inline-flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              Customize Instead <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* SECTION B: CUSTOMIZE PANEL — revealed after a tier is selected */}
        {customizing && tier && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* CUSTOMIZE CONTROLS PANEL (7 cols) */}
            <div className="lg:col-span-7 bg-white border-[6px] border-black p-6 md:p-8 shadow-[8px_8px_0px_#000] rounded-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-black pb-4 mb-6">
                <h3 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
                  <Calculator className="h-6 w-6 stroke-3" /> Customize This Build
                </h3>
                <button
                  onClick={resetToTierDefaults}
                  className="inline-flex items-center gap-2 border-4 border-black bg-white px-3 py-2 text-[11px] font-black uppercase shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" /> Reset to {tier.name}
                </button>
              </div>

              {/* Baseline banner */}
              <div className="border-4 border-black bg-yellow-300 px-4 py-3 mb-6 font-mono text-xs font-black uppercase flex flex-wrap items-center justify-between gap-2">
                <span>Baseline: {tier.name} — from {inr(tier.rangeLow)}</span>
                <span className="text-neutral-600">
                  {tier.fixedPages ? "1 page" : `${tier.pages} pages`} · {tier.design} design · {tier.features.length} feature{tier.features.length === 1 ? "" : "s"} included
                </span>
              </div>

              <div className="flex flex-col gap-6">

                {/* Industry vertical chip select */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider font-mono block mb-3">
                    🏥 Industry Vertical
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {INDUSTRIES.map((ind) => {
                      const active = industry === ind;
                      return (
                        <button
                          key={ind}
                          onClick={() => setIndustry(ind)}
                          className={`px-4 py-2 text-xs font-black uppercase border-4 border-black transition-all active:translate-y-0.5 cursor-pointer ${
                            active ? "bg-black text-white" : "bg-white hover:bg-yellow-200 shadow-[3px_3px_0px_#000]"
                          }`}
                        >
                          {ind}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Number of pages — hidden/disabled for fixed single-page Landing tier */}
                {tier.fixedPages ? (
                  <div className="border-4 border-black p-5 bg-orange-100">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider font-mono">
                        📄 Number of Pages
                      </span>
                      <span className="h-8 min-w-14 px-2 inline-flex items-center justify-center border-4 border-black bg-white font-mono font-black text-base">
                        {pagesStep}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono font-bold uppercase text-neutral-600 mt-3">
                      Fixed single-page scope — not applicable to {tier.name}.
                    </p>
                  </div>
                ) : (
                  <div className="border-4 border-black p-5 bg-orange-100">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider font-mono">
                        📄 Number of Pages
                      </span>
                      <span className="h-8 min-w-14 px-2 inline-flex items-center justify-center border-4 border-black bg-white font-mono font-black text-base">
                        {pagesStep}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={pagesStep}
                      onChange={(e) => setPagesStep(parseInt(e.target.value))}
                      className="w-full cursor-pointer accent-[#F27D26]"
                    />
                    <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-neutral-600 mt-1">
                      <span>1 Page</span>
                      <span>20 Pages</span>
                    </div>
                    <p className="text-[10px] font-mono font-bold uppercase text-neutral-600 mt-2">
                      {tier.pages} pages included · +{inr(PAGE_FEE)}/page beyond that (est.)
                    </p>
                  </div>
                )}

                {/* Design complexity slider */}
                <div className="border-4 border-black p-5 bg-white">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      🎨 Design Complexity
                    </span>
                    <span className="h-8 px-2 inline-flex items-center justify-center border-4 border-black bg-white font-mono font-black text-base">
                      {design}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={DESIGN_LEVELS.length - 1}
                    step={1}
                    value={designStep}
                    onChange={(e) => setDesignStep(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-[#F27D26]"
                  />
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {DESIGN_LEVELS.map((level) => {
                      const upcharge = Math.max(0, DESIGN_FEES[level] - DESIGN_FEES[tier.design]);
                      const active = level === design;
                      return (
                        <button
                          key={level}
                          onClick={() => setDesignStep(DESIGN_LEVELS.indexOf(level))}
                          className={`py-1.5 text-[10px] font-black uppercase border-2 border-black transition-all ${
                            active ? "bg-black text-white" : "bg-yellow-200 hover:bg-yellow-300"
                          }`}
                        >
                          {level}
                          <span className="block font-mono font-bold mt-0.5">
                            {upcharge ? `+${inr(upcharge)} est.` : "included"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-mono font-bold uppercase text-neutral-600 mt-2">
                    {tier.design} design included with {tier.name}
                  </p>
                </div>

                {/* Features checkboxes */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider font-mono block mb-3">
                    ⚙️ Features
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FEATURE_IDS.map((id) => {
                      const cfg = FEATURES[id];
                      const included = tier.features.includes(id);
                      const active = featuresState[id];
                      return (
                        <div
                          key={id}
                          onClick={() => toggleFeature(id)}
                          className={`border-4 border-black p-4 cursor-pointer flex items-start justify-between gap-3 transition-all select-none active:translate-y-0.5 ${
                            active
                              ? cfg.recurring
                                ? "bg-pink-300 shadow-[4px_4px_0px_#000]"
                                : "bg-yellow-300 shadow-[4px_4px_0px_#000]"
                              : "bg-white hover:bg-neutral-50"
                          }`}
                        >
                          <div>
                            <h4 className="text-sm font-black uppercase leading-tight">{cfg.label}</h4>
                            <p className="text-[10px] text-neutral-600 mt-1 font-mono font-bold uppercase">
                              {cfg.recurring ? `${inr(cfg.fee)}/month · est.` : `+ ${inr(cfg.fee)} est.`}
                              {included ? " · included in package" : ""}
                            </p>
                          </div>
                          <div className="h-7 w-7 shrink-0 border-4 border-black bg-white flex items-center justify-center font-black">
                            {active ? "✓" : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Timeframe */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider font-mono block mb-3">
                    🚀 Delivery Timeframe
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "Standard" as DeliveryChoice, label: "Standard Priority Delivery", days: COUNT_DOWN_STANDARD, feeNote: "Included" },
                      { id: "Express" as DeliveryChoice, label: "Express First Class", days: COUNT_DOWN_EXPRESS, feeNote: `+${inr(EXPRESS_FEE)} est.` },
                    ].map((opt) => {
                      const active = delivery === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setDelivery(opt.id)}
                          className={`p-4 border-4 border-black text-sm font-black uppercase text-left transition-all relative ${
                            active ? "bg-orange-300 translate-y-1 shadow-[2px_2px_0px_#000]" : "bg-white hover:bg-neutral-50 shadow-[4px_4px_0px_#000]"
                          }`}
                        >
                          {opt.label}
                          <span className="text-[10px] block font-normal font-mono text-neutral-600 uppercase mt-1">
                            {opt.days} ({opt.feeNote})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* LIVE ESTIMATE OUTPUT & CTA (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 flex flex-col gap-6">
              
              {/* Display Box */}
              <div className="bg-yellow-400 border-[6px] border-black p-6 md:p-8 shadow-[8px_8px_0px_#000] rotate-[0.5deg]">
                <span className="text-xs font-bold uppercase tracking-wider font-mono block mb-2 text-neutral-800">
                  [LIVE ESTIMATE OVERVIEW]
                </span>
                
                <div className="flex justify-between items-baseline border-b-4 border-black pb-4 mb-2">
                  <span className="text-lg font-black uppercase">Estimated Total</span>
                  <span className="text-3xl md:text-5xl font-black font-sans bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#000]">
                    {inr(oneTime)}
                  </span>
                </div>
                <p className="text-[10px] font-mono font-bold uppercase text-neutral-700 mb-4">
                  ⚠ This is an estimate — final quote confirmed after a quick scope call.
                </p>

                {/* Breakdown */}
                <ul className="text-xs font-mono flex flex-col gap-2 bg-white/60 p-4 border-2 border-black text-left mb-4 font-semibold">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className={item.recurring ? "text-pink-600 font-black" : ""}
                    >
                      {item.recurring ? "⟳ " : "✓ "}{item.text}
                    </li>
                  ))}
                  <li className="text-sm font-black border-t-2 border-black pt-2 mt-1">
                    EST. TOTAL (ONE-TIME): {inr(oneTime)}
                  </li>
                  {monthly > 0 && (
                    <li className="text-pink-600 font-black">
                      RECURRING (EST.): {inr(monthly)}/month — keep the site maintained
                    </li>
                  )}
                  <li className="text-neutral-600 font-bold">
                    INDUSTRY VERTICAL: {industry.toUpperCase()}
                  </li>
                </ul>

                {isSubmitted ? (
                  <div className="bg-lime-400 border-4 border-black p-4 font-black uppercase text-center text-sm shadow-[4px_4px_0px_#000] my-2 animate-bounce">
                    🎉 SPECIFICATION SUBMITTED! EST. BUDGET: {inr(oneTime)}{monthly > 0 ? ` + ${inr(monthly)}/month` : ""}
                  </div>
                ) : (
                  <button
                    className="w-full py-4 neo-brutal-btn text-white hover:opacity-90 hover:scale-[1.01] transition-all text-lg font-black uppercase tracking-wide flex items-center justify-center gap-3 active:translate-y-1 cursor-pointer"
                    onClick={submitRequest}
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
                    No hidden margins. You configure what you activate, and we ship within the specified priority windows. Simple!
                  </p>
                </div>
              </div>

              {/* Delivery badge */}
              <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_#000] rotate-1 flex items-start gap-3">
                <Rocket className="h-6 w-6 stroke-2 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black uppercase">{delivery === "Express" ? "Express Dispatch" : "Standard Delivery"}</h4>
                  <p className="text-xs mt-1 leading-snug font-mono uppercase">
                    {delivery === "Express" ? `${COUNT_DOWN_EXPRESS} · priority lane` : `${COUNT_DOWN_STANDARD} · included in price`}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}