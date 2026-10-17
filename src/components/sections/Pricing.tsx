"use client";

import { useState, useMemo } from "react";
import { ArrowUpRight, Mail, Phone, Check } from "lucide-react";
import { cn } from "../../lib/utils";

const WHATSAPP_NUMBER = "8792009091";
const WHATSAPP_MESSAGE_PREFIX =
  "Hi Suman, I'd like a website estimate. My choices: ";
const CONTACT_EMAIL = "sumankd0000@gmail.com";

type TierId = "landing" | "starter" | "growth" | "custom";

interface Tier {
  id: TierId;
  name: string;
  rangeLow: number;
  rangeHigh: number;
  rangeLabel: string;
  pages: number;
  fixedPages: boolean;
  design: string;
  blurb: string;
  included: string[];
  baseFee: number;
  perPageFee: number;
}

const TIERS: Tier[] = [
  {
    id: "landing",
    name: "Landing Page",
    rangeLow: 17000,
    rangeHigh: 25000,
    rangeLabel: "₹17,000 – ₹25,000",
    pages: 1,
    fixedPages: true,
    design: "Standard",
    blurb: "A single high-converting page built to capture leads fast.",
    included: [
      "Single page — hero and CTA",
      "Mobile-responsive",
      "Contact form",
      "Fast turnaround",
    ],
    baseFee: 17000,
    perPageFee: 0,
  },
  {
    id: "starter",
    name: "Starter Site",
    rangeLow: 28000,
    rangeHigh: 35000,
    rangeLabel: "₹28,000 – ₹35,000",
    pages: 4,
    fixedPages: false,
    design: "Standard",
    blurb: "A clean, quick launch for a single service or business.",
    included: [
      "Up to 4 pages",
      "Mobile-responsive",
      "Standard design",
      "Contact form",
    ],
    baseFee: 28000,
    perPageFee: 2000,
  },
  {
    id: "growth",
    name: "Growth Site",
    rangeLow: 50000,
    rangeHigh: 65000,
    rangeLabel: "₹50,000 – ₹65,000",
    pages: 8,
    fixedPages: false,
    design: "Custom",
    blurb: "Booking-first build for appointment-driven businesses.",
    included: [
      "Up to 8 pages",
      "Booking/appointment integration",
      "Custom design",
      "Basic CMS",
    ],
    baseFee: 50000,
    perPageFee: 2000,
  },
  {
    id: "custom",
    name: "Custom Build",
    rangeLow: 80000,
    rangeHigh: 0, // open ended
    rangeLabel: "₹80,000 and above",
    pages: 10,
    fixedPages: false,
    design: "Custom",
    blurb:
      "A fully bespoke platform with industry-specific features.",
    included: [
      "10+ pages",
      "Fully custom design",
      "CMS plus e-commerce or booking as needed",
      "Industry-specific features",
    ],
    baseFee: 80000,
    perPageFee: 2000,
  },
];

const FEATURES = [
  { id: "booking", label: "Booking / appointment system", fee: 8000 },
  { id: "cms", label: "CMS (content editing)", fee: 6000 },
  { id: "ecom", label: "E-commerce", fee: 15000 },
  { id: "seo", label: "SEO setup", fee: 4000 },
  { id: "photo", label: "Photography add-on", fee: 10000 },
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function PricingSection() {
  const [tierId, setTierId] = useState<TierId>("landing");
  const [pages, setPages] = useState(4);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");

  const tier = useMemo(() => TIERS.find((t) => t.id === tierId)!, [tierId]);

  const estimate = useMemo(() => {
    const tierDesignFee = tier.baseFee;
    const extraPages = Math.max(0, pages - tier.pages);
    const designUpcharge =
      tier.design === "Custom" && tier.id !== "custom" ? 10000 : 0;
    const featureTotal = Object.entries(features).reduce((sum, [id, on]) => {
      if (on) {
        const f = FEATURES.find((x) => x.id === id);
        return sum + (f ? f.fee : 0);
      }
      return sum;
    }, 0);
    const expressFee = delivery === "express" ? 8000 : 0;
    const oneTime =
      tierDesignFee + extraPages * tier.perPageFee + designUpcharge + featureTotal + expressFee;
    const low = Math.round(oneTime * 0.85);
    const high = Math.round(oneTime * 1.15);
    return { oneTime, low, high, extraPages, featureTotal, expressFee };
  }, [tier, pages, features, delivery]);

  const toggleFeature = (id: string) => {
    setFeatures((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const shareText = encodeURIComponent(
    `${WHATSAPP_MESSAGE_PREFIX}\nPackage: ${tier.name}\nPages: ${pages}\nFeatures: ${Object.entries(features).filter(([, on]) => on).map(([id]) => FEATURES.find((f) => f.id === id)?.label).join(", ") || "None"}\nEstimate: ${inr(estimate.low)} – ${inr(estimate.high)}\nDelivery: ${delivery === "express" ? "Express" : "Standard"}\n\nPlease share your final quote.`
  );

  const mailtoSubject = encodeURIComponent(`Website estimate — ${tier.name}`);
  const mailtoBody = encodeURIComponent(
    `Hi Suman,\n\nI'd like a website estimate based on my choices on your portfolio:\n\nPackage: ${tier.name}\nPages: ${pages}\nFeatures: ${Object.entries(features).filter(([, on]) => on).map(([id]) => FEATURES.find((f) => f.id === id)?.label).join(", ") || "None"}\nEstimate: ${inr(estimate.low)} – ${inr(estimate.high)}\nDelivery: ${delivery === "express" ? "Express" : "Standard"}\n\nPlease share your final quote.\n`
  );

  return (
    <section
      id="pricing"
      className="py-24 px-6 lg:px-12 bg-white/[0.02]"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-ink">
            Clear pricing before we talk
          </h2>
          <p className="mt-3 text-base text-muted max-w-[60ch] mx-auto">
            One-time estimates in INR. Pick what you need and the number
            updates instantly.
          </p>
        </div>

        {/* Preset packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {TIERS.map((t) => {
            const active = tierId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTierId(t.id);
                  setPages(t.pages);
                  setFeatures({});
                  setDelivery("standard");
                }}
                className={cn(
                  "flex flex-col gap-3 rounded-[1.5rem] border p-6 text-left transition-all",
                  active
                    ? "border-accent bg-white/[0.03] shadow-[2px_2px_0px_rgba(190,24,93,0.15)]"
                    : "border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                )}
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
                  {t.design} design
                </span>
                <h3 className="text-xl font-bold text-ink">{t.name}</h3>
                <p className="text-sm text-muted leading-relaxed">{t.blurb}</p>
                <div className="mt-auto">
                  <span className="text-2xl font-bold text-ink">{inr(t.rangeLow)}</span>{" "}
                  {t.rangeHigh > 0 ? (
                    <span className="text-sm text-muted"> – {inr(t.rangeHigh)}</span>
                  ) : (
                    <span className="text-sm text-muted"> and above</span>
                  )}
                </div>
                <ul className="mt-3 space-y-1">
                  {t.included.map((line) => (
                    <li key={line} className="text-xs text-muted flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Estimate builder */}
        <div className="rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 md:p-10 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">
              Build your estimate
            </span>
            <h3 className="text-xl font-bold text-ink">
              Choose what you need
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pages */}
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted mb-3">
                Number of pages
              </label>
              {tier.fixedPages ? (
                <div className="text-sm text-ink">
                  Fixed: {tier.pages} page{tier.pages !== 1 ? "s" : ""}
                </div>
              ) : (
                <>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={pages}
                    onChange={(e) => setPages(parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted">
                    <span>1 Page</span>
                    <span>20 Pages</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {tier.pages} included · +{inr(tier.perPageFee)} per extra page
                  </p>
                </>
              )}
            </div>

            {/* Features */}
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted mb-3">
                Add features
              </label>
              <div className="space-y-2">
                {FEATURES.map((f) => {
                  const on = Boolean(features[f.id]);
                  const included = tier.included.some((i) =>
                    i.toLowerCase().includes(f.label.split(" /")[0].toLowerCase())
                  );
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFeature(f.id)}
                      disabled={included}
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-3 text-left transition-all text-sm",
                        on
                          ? "border-accent bg-white/[0.03] text-accent"
                          : included
                          ? "border-white/10 bg-white/[0.02] text-muted opacity-50"
                          : "border-white/5 bg-white/[0.02] text-muted hover:border-white/20"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        readOnly
                        className="accent-accent"
                      />
                      <span>{f.label}</span>
                      {!included && (
                        <span className="ml-auto text-[10px] font-mono text-muted">
                          +{inr(f.fee)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery + total */}
            <div className="lg:col-span-1 flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted mb-3">
                  Delivery
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setDelivery("standard")}
                    className={cn(
                      "w-full py-2 rounded-md border text-left text-sm transition-all",
                      delivery === "standard"
                        ? "border-accent bg-white/[0.03] text-accent font-semibold"
                        : "border-white/5 bg-white/[0.02] text-muted hover:border-white/20"
                    )}
                  >
                    Standard — included
                  </button>
                  <button
                    onClick={() => setDelivery("express")}
                    className={cn(
                      "w-full py-2 rounded-md border text-left text-sm transition-all",
                      delivery === "express"
                        ? "border-accent bg-white/[0.03] text-accent font-semibold"
                        : "border-white/5 bg-white/[0.02] text-muted hover:border-white/20"
                    )}
                  >
                    Express — +{inr(8000)}
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-bold text-ink">Estimated total</span>
                  <span className="text-4xl font-bold text-accent">
                    {inr(estimate.oneTime)}
                  </span>
                </div>
                <p className="text-xs text-muted mb-6">
                  Range: {inr(estimate.low)} – {inr(estimate.high)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-accent bg-accent text-ground px-6 py-3 text-sm font-bold shadow-[2px_2px_0px_rgba(190,24,93,0.25)] active:translate-[1px_1px] active:shadow-none transition-all"
                >
                  <Phone className="h-4 w-4" /> WhatsApp Suman
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 text-ink px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  <Mail className="h-4 w-4" /> Email Suman
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
