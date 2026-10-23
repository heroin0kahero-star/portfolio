/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Calculator,
  CheckCircle,
  MessageSquare,
  Rocket,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { CONTACT_EMAIL } from "../../data";
import { PricingCard } from "../pricing/PricingCard";
import { RepeatedTextHeading } from "../pricing/RepeatedTextHeading";
import "../pricing/pricing.css";

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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [pagesStep, setPagesStep] = useState<number>(4);
  const [designStep, setDesignStep] = useState<number>(1);
  const [featuresState, setFeaturesState] = useState<Record<FeatureId, boolean>>(
    Object.fromEntries(FEATURE_IDS.map((id) => [id, false])) as Record<FeatureId, boolean>
  );
  const [delivery, setDelivery] = useState<DeliveryChoice>("Standard");
  const [industry, setIndustry] = useState<string>("Other");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pause the idle float whenever the card row is off-screen.
  useEffect(() => {
    const grid = cardsRef.current;
    if (!grid) return;

    if (!("IntersectionObserver" in window)) {
      grid.classList.add("is-live");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          grid.classList.toggle("is-live", entry.isIntersecting);
        });
      },
      { rootMargin: "120px 0px 120px 0px" }
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

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

  const startCustomizing = () => {
    applyTier("starter");
    window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="pricing-section py-24 md:py-32 select-none scroll-smooth"
    >
      <div className="pricing-shell">
        <div className="pricing-gutter">
          <div className="pricing-eyebrow-row">
            <span className="pricing-eyebrow-rule" aria-hidden="true" />
            <span className="pricing-eyebrow">Pricing</span>
          </div>
        </div>

        <RepeatedTextHeading />

        <div className="pricing-gutter">
          <p className="pricing-subtitle">
            One-time project pricing in INR. Pick the closest package, then adjust the scope
            to fit your business.
          </p>

          {/* SECTION A: PRESET PACKAGE CARDS */}
          <div className="pricing-cards-block">
            <span className="pricing-cards-eyebrow">Choose a starting point</span>
            <div className="pricing-cards" ref={cardsRef}>
              {TIERS.map((t) => (
                <PricingCard
                  key={t.id}
                  name={t.name}
                  price={t.rangeLabel}
                  blurb={t.blurb}
                  features={t.included}
                  active={selectedTier === t.id}
                  onSelect={() => applyTier(t.id)}
                />
              ))}
            </div>
          </div>

          {/* Standalone customize link */}
          <div className="pricing-customize">
            <span>Want a different mix?</span>
            <button
              type="button"
              onClick={startCustomizing}
              className="pricing-customize__link"
            >
              Customize instead <ArrowRight aria-hidden="true" />
            </button>
          </div>

          {/* SECTION B: CUSTOMIZE PANEL — revealed after a tier is selected */}
          {customizing && tier && (
            <div ref={panelRef} className="pricing-panel scroll-mt-24">

              {/* CUSTOMIZE CONTROLS PANEL */}
              <div className="pricing-panel__controls">
                <div className="pricing-panel__head">
                  <h3 className="pricing-panel__title">
                    <Calculator className="h-6 w-6" aria-hidden="true" /> Customize this build
                  </h3>
                  <button
                    type="button"
                    onClick={resetToTierDefaults}
                    className="pricing-ghost-btn"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset to {tier.name}
                  </button>
                </div>

                {/* Baseline banner */}
                <div className="pricing-baseline">
                  <span>Baseline: {tier.name} — from {inr(tier.rangeLow)}</span>
                  <span className="pricing-baseline__meta">
                    {tier.fixedPages ? "1 page" : `${tier.pages} pages`} · {tier.design} design · {tier.features.length} feature{tier.features.length === 1 ? "" : "s"} included
                  </span>
                </div>

                <div className="pricing-controls">

                  {/* Industry vertical chip select */}
                  <div>
                    <span className="pricing-field__label">Industry</span>
                    <div className="pricing-chips">
                      {INDUSTRIES.map((ind) => {
                        const active = industry === ind;
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => setIndustry(ind)}
                            aria-pressed={active}
                            className={`pricing-chip${active ? " is-active" : ""}`}
                          >
                            {ind}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Number of pages — hidden/disabled for fixed single-page Landing tier */}
                  <div className="pricing-field">
                    <div className="pricing-field__row">
                      <span className="pricing-field__label" style={{ marginBottom: 0 }}>
                        Number of pages
                      </span>
                      <span className="pricing-field__value">{pagesStep}</span>
                    </div>

                    {tier.fixedPages ? (
                      <p className="pricing-field__hint">
                        Fixed single-page scope — not applicable to {tier.name}.
                      </p>
                    ) : (
                      <>
                        <input
                          id="pricing-pages"
                          type="range"
                          min={1}
                          max={20}
                          step={1}
                          value={pagesStep}
                          aria-label="Number of pages"
                          onChange={(e) => setPagesStep(parseInt(e.target.value))}
                          className="pricing-range"
                        />
                        <div className="pricing-range-scale">
                          <span>1 Page</span>
                          <span>20 Pages</span>
                        </div>
                        <p className="pricing-field__hint">
                          {tier.pages} pages included · +{inr(PAGE_FEE)}/page beyond that (est.)
                        </p>
                      </>
                    )}
                  </div>

                  {/* Design complexity slider */}
                  <div className="pricing-field">
                    <div className="pricing-field__row">
                      <span className="pricing-field__label" style={{ marginBottom: 0 }}>
                        Design complexity
                      </span>
                      <span className="pricing-field__value">{design}</span>
                    </div>
                    <input
                      id="pricing-design"
                      type="range"
                      min={0}
                      max={DESIGN_LEVELS.length - 1}
                      step={1}
                      value={designStep}
                      aria-label="Design complexity"
                      onChange={(e) => setDesignStep(parseInt(e.target.value))}
                      className="pricing-range"
                    />
                    <div className="pricing-design-grid">
                      {DESIGN_LEVELS.map((level) => {
                        const upcharge = Math.max(0, DESIGN_FEES[level] - DESIGN_FEES[tier.design]);
                        const active = level === design;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setDesignStep(DESIGN_LEVELS.indexOf(level))}
                            aria-pressed={active}
                            className={`pricing-design-btn${active ? " is-active" : ""}`}
                          >
                            {level}
                            <span>
                              {upcharge ? `+${inr(upcharge)} est.` : "included"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="pricing-field__hint">
                      {tier.design} design included with {tier.name}
                    </p>
                  </div>

                  {/* Features checkboxes */}
                  <div>
                    <span className="pricing-field__label">Features</span>
                    <div className="pricing-feature-grid">
                      {FEATURE_IDS.map((id) => {
                        const cfg = FEATURES[id];
                        const included = tier.features.includes(id);
                        const active = featuresState[id];
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleFeature(id)}
                            aria-pressed={active}
                            className={`pricing-feature${active ? " is-active" : ""}`}
                          >
                            <span>
                              <span className="pricing-feature__label">{cfg.label}</span>
                              <span className="pricing-feature__meta">
                                {cfg.recurring ? `${inr(cfg.fee)}/month · est.` : `+ ${inr(cfg.fee)} est.`}
                                {included ? " · included in package" : ""}
                              </span>
                            </span>
                            <span className="pricing-feature__check" aria-hidden="true">
                              {active ? <CheckCircle className="h-3.5 w-3.5" /> : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Timeframe */}
                  <div>
                    <span className="pricing-field__label">Delivery timeframe</span>
                    <div className="pricing-delivery-grid">
                      {[
                        { id: "Standard" as DeliveryChoice, label: "Standard delivery", days: COUNT_DOWN_STANDARD, feeNote: "Included" },
                        { id: "Express" as DeliveryChoice, label: "Express delivery", days: COUNT_DOWN_EXPRESS, feeNote: `+${inr(EXPRESS_FEE)} est.` },
                      ].map((opt) => {
                        const active = delivery === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setDelivery(opt.id)}
                            aria-pressed={active}
                            className={`pricing-delivery${active ? " is-active" : ""}`}
                          >
                            <span className="pricing-delivery__label">{opt.label}</span>
                            <span className="pricing-delivery__meta">
                              {opt.days} ({opt.feeNote})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* LIVE ESTIMATE OUTPUT & CTA */}
              <div className="pricing-panel__estimate">

                {/* Display Box */}
                <div className="pricing-estimate">
                  <span className="pricing-field__label">Your estimate</span>

                  <div className="pricing-estimate__total">
                    <span className="pricing-estimate__total-label">Estimated total</span>
                    <span aria-live="polite" className="pricing-estimate__amount">
                      {inr(oneTime)}
                    </span>
                  </div>
                  <p className="pricing-estimate__fine">
                    This is an estimate. Final quote confirmed after a quick scope call.
                  </p>

                  {/* Breakdown */}
                  <ul className="pricing-estimate__list">
                    {items.map((item, i) => (
                      <li
                        key={i}
                        className={item.recurring ? "is-recurring" : ""}
                      >
                        {item.recurring ? "Recurring: " : ""}{item.text}
                      </li>
                    ))}
                    <li className="is-total">
                      Estimated total (one-time): {inr(oneTime)}
                    </li>
                    {monthly > 0 && (
                      <li className="is-recurring">
                        Recurring estimate: {inr(monthly)}/month
                      </li>
                    )}
                    <li className="is-muted">
                      Industry: {industry}
                    </li>
                  </ul>

                  {isSubmitted ? (
                    <div role="status" className="pricing-status">
                      Request ready. Your email app should open with the details filled in.
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="pricing-submit"
                      onClick={submitRequest}
                    >
                      Send this request <Sparkles className="h-5 w-5 fill-current" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Trust note */}
                <div className="pricing-trust">
                  <MessageSquare aria-hidden="true" />
                  <div>
                    <h4>Transparent billing</h4>
                    <p>
                      No hidden margins. You choose what you need, and the final quote is agreed
                      before any work starts.
                    </p>
                  </div>
                </div>

                {/* Delivery badge */}
                <div className="pricing-delivery-card">
                  <Rocket aria-hidden="true" />
                  <div>
                    <h4>{delivery === "Express" ? "Express delivery" : "Standard delivery"}</h4>
                    <p>
                      {delivery === "Express" ? `${COUNT_DOWN_EXPRESS} · priority lane` : `${COUNT_DOWN_STANDARD} · included in price`}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
