/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Pricing — a pinned horizontal track. The "Price" heading is the first panel,
 * followed by the four package cards sliding over a still red rose. Motion is
 * a GSAP ScrollTrigger pin + scrub port of GreenSock's "Horizontal snapping
 * sections" pattern.
 */

import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PricingCard } from "./pricing/PricingCard";
import { RepeatedTextHeading } from "./pricing/RepeatedTextHeading";
import "./pricing/pricing.css";

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  // Pause the idle float whenever the card row is off-screen.
  useLayoutEffect(() => {
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

  // Pin the section and translate the track sideways as the page scrolls.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;

    const context = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    // Web fonts and the portal reveal change the measured width. Re-measure
    // once the layout has settled so the pin ends exactly with the track.
    const frame = window.requestAnimationFrame(refresh);
    void document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      context.revert();
    };
  }, []);

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="price"
      ref={sectionRef}
    >
      <div className="price__track" ref={trackRef}>
        <div className="price__panel price__heading">
          <RepeatedTextHeading />
        </div>

        <div className="price__cards" ref={cardsRef}>
          {PACKAGES.map((pkg, index) => (
            <div className="price__card" key={pkg.id}>
              <PricingCard
                index={index}
                name={pkg.name}
                price={pkg.price}
                blurb={pkg.blurb}
                features={pkg.features}
                ctaHref="#contact"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
