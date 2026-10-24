/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Pricing — lens distortion background, "Price" heading with demo 3 motion,
 * and four floating 3D package cards. No customizer, no live estimate: the
 * four starting points are the whole interaction, with a single route to the
 * contact section from each card.
 */

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { PricingCard } from "./pricing/PricingCard";
import { RepeatedTextHeading } from "./pricing/RepeatedTextHeading";
import { LensDistortion } from "./pricing/LensDistortion";
import "./pricing/pricing.css";

// Portrait sources from About section
const PORTRAIT_BW = "/images/projects/imeags/portrait-1-bw.webp";
const PORTRAIT_RED = "/images/projects/imeags/portrait-2-red.webp";

interface PricingPackage {
  id: string;
  name: string;
  price: string;
  blurb: string;
  features: string[];
}

const PACKAGES: PricingPackage[] = [
  {
    id: "landing",
    name: "Landing Page",
    price: "₹17,000–₹25,000",
    blurb: "A focused single page built to turn visitors into enquiries.",
    features: [
      "Single-page scope — hero + CTA",
      "Mobile-responsive layout",
      "Contact form",
      "Fast turnaround",
    ],
  },
  {
    id: "starter",
    name: "Starter Site",
    price: "₹28,000–₹35,000",
    blurb: "A clean, quick launch for a single service or local business.",
    features: [
      "Up to 4 pages",
      "Mobile-responsive layout",
      "Standard design",
      "Contact form",
    ],
  },
  {
    id: "growth",
    name: "Growth Site",
    price: "₹50,000–₹65,000",
    blurb: "A booking-first build for appointment-driven businesses.",
    features: [
      "Up to 8 pages",
      "Booking / appointment integration",
      "Custom design",
      "Basic CMS",
    ],
  },
  {
    id: "custom",
    name: "Custom Build",
    price: "₹80,000 and above",
    blurb: "A fully bespoke platform with industry-specific features.",
    features: [
      "10+ pages",
      "Fully custom design",
      "CMS + e-commerce / booking as needed",
      "Industry-specific features",
    ],
  },
];

export default function PricingSection() {
  const cardsRef = useRef<HTMLDivElement | null>(null);

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
      { rootMargin: "160px 0px 160px 0px" },
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="pricing-section"
    >
      {/* Lens distortion background — z-index 0 */}
      <div className="pricing-lens-wrapper" aria-hidden="true">
        <LensDistortion
          insideSrc={PORTRAIT_RED}
          outsideSrc={PORTRAIT_BW}
          squareSize={0.4}
        />
      </div>

      <div className="pricing-shell">
        <div className="pricing-gutter">
          <div className="pricing-eyebrow-row">
            <span className="pricing-eyebrow-rule" aria-hidden="true" />
            <span className="pricing-eyebrow">Pricing</span>
          </div>
        </div>

        <RepeatedTextHeading />

        <div className="pricing-gutter">
          <div className="pricing-intro-row">
            <p className="pricing-subtitle">
              Four starting points, priced in INR. Pick the closest fit and we
              agree the final scope in writing before any work begins.
            </p>
            <span className="pricing-count">04 packages</span>
          </div>

          <div className="pricing-cards" ref={cardsRef}>
            {PACKAGES.map((pkg, index) => (
              <PricingCard
                key={pkg.id}
                index={index}
                name={pkg.name}
                price={pkg.price}
                blurb={pkg.blurb}
                features={pkg.features}
                ctaHref="#contact"
              />
            ))}
          </div>

          <div className="pricing-footnote">
            <p>
              Every figure is a one-time project estimate. The final quote is
              confirmed after a short scope conversation.
            </p>
            <a href="#contact" className="pricing-footnote__link">
              Not sure which fits? Let&apos;s talk
              <ArrowUpRight aria-hidden="true" size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
