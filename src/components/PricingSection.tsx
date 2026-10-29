/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Pricing — a pinned horizontal track. The "Price" heading is the first panel,
 * followed by the four package cards sliding over the rose lens background.
 * Motion is a GSAP ScrollTrigger pin + scrub port of GreenSock's "Horizontal
 * snapping sections" pattern, with the same card entrance language as About.
 */

import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PricingCard } from "./pricing/PricingCard";
import { RepeatedTextHeading } from "./pricing/RepeatedTextHeading";
import "./pricing/pricing.css";

gsap.registerPlugin(ScrollTrigger);

// Keep Three.js out of the initial bundle; the lens loads as the section nears
// the viewport.
const LensDistortion = lazy(() =>
  import("./pricing/LensDistortion").then((module) => ({
    default: module.LensDistortion,
  })),
);

const DESKTOP_QUERY = "(min-width: 901px)";
const MOBILE_QUERY = "(max-width: 900px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
const ROSE_SRC = "/images/projects/imeags/rose.jpg";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

interface PricingPackage {
  id: string;
  name: string;
  price: string;
  blurb: string;
  features: string[];
}

interface CardMetric {
  start: number;
  end: number;
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
      "Mobile-responsive layout",
      "Contact form",
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
      "Mobile-responsive layout",
      "Contact form",
    ],
  },
];

export default function PricingSection() {
  const pinRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [showLens, setShowLens] = useState(false);

  // Mount the WebGL lens only on pointer-capable desktop layouts with motion
  // enabled, and only while the section is near the viewport.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const query = window.matchMedia(`${DESKTOP_QUERY} and ${MOTION_QUERY}`);
    let inRange = false;
    const sync = () => setShowLens(inRange && query.matches);

    if (!("IntersectionObserver" in window)) {
      setShowLens(query.matches);
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        inRange = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(section);
    query.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", sync);
    };
  }, []);

  // Pause the idle float whenever the card row is off-screen.
  useLayoutEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;

    if (!("IntersectionObserver" in window)) {
      cards.classList.add("is-live");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          cards.classList.toggle("is-live", entry.isIntersecting);
        });
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(cards);
    return () => observer.disconnect();
  }, []);

  // Pin the section with a sticky wrapper and translate the track sideways as
  // the page scrolls. Sticky pinning (rather than ScrollTrigger's pin-spacer)
  // keeps keyboard focus inside the section stable.
  useLayoutEffect(() => {
    const pin = pinRef.current;
    const section = sectionRef.current;
    const track = trackRef.current;
    const cardsRoot = cardsRef.current;
    if (!pin || !section || !track || !cardsRoot) return;

    const matchMedia = gsap.matchMedia();

    /* ---------------------------------------------------------------- */
    /* Desktop: pinned horizontal track with a scroll-driven card entry  */
    /* ---------------------------------------------------------------- */

    matchMedia.add(`${DESKTOP_QUERY} and ${MOTION_QUERY}`, () => {
      const cardEls = Array.from(
        cardsRoot.querySelectorAll<HTMLElement>(".price__card"),
      );
      const shells = cardEls.map((card) =>
        card.querySelector<HTMLElement>(".price__card-shell"),
      );
      const motions = cardEls.map((card) =>
        card.querySelector<HTMLElement>(".price__card-motion"),
      );

      const entered = new Set<number>();
      let metrics: { distance: number; cards: CardMetric[] } = {
        distance: 0,
        cards: [],
      };
      let resizeFrame = 0;
      let refreshFrame = 0;
      let disposed = false;

      section.classList.add("price--motion");
      pin.classList.add("price__pin--motion");

      const measure = () => {
        const width = section.clientWidth || window.innerWidth;
        const distance = Math.max(0, track.scrollWidth - width);
        const trackLeft = track.getBoundingClientRect().left;

        // The wrapper supplies exactly one viewport of travel per pinned pixel.
        pin.style.height = `${section.offsetHeight + distance}px`;

        metrics = {
          distance,
          cards: cardEls.map((card) => {
            const left = card.getBoundingClientRect().left - trackLeft;
            const cardWidth = card.offsetWidth;
            if (distance <= 0) return { start: 0, end: 1 };

            return {
              start: clamp01((left - width) / distance),
              end: clamp01((left + cardWidth - width) / distance),
            };
          }),
        };
      };

      const resetMotion = (motion: HTMLElement | null) => {
        if (!motion) return;
        gsap.killTweensOf(motion);
        motion.style.removeProperty("transform");
        motion.style.removeProperty("opacity");
      };

      // The same one-shot flourish used by About's cards: power3.out, 0.72s.
      const playFlourish = (motion: HTMLElement, index: number) => {
        const fromLeft = index % 2 === 0;
        gsap.killTweensOf(motion);
        gsap.fromTo(
          motion,
          {
            scale: 0.94,
            y: fromLeft ? -10 : 12,
            rotationY: fromLeft ? 8 : -8,
          },
          {
            scale: 1,
            y: 0,
            rotationY: 0,
            duration: 0.72,
            ease: "power3.out",
            overwrite: true,
            clearProps: "opacity,transform",
          },
        );
      };

      const updateCards = (progress: number) => {
        metrics.cards.forEach((metric, index) => {
          const span = Math.max(0.0001, metric.end - metric.start);
          const entry = clamp01((progress - metric.start) / span);
          const eased = 1 - Math.pow(1 - entry, 3);
          const side = index % 2 === 0 ? -1 : 1;
          const shell = shells[index];
          const motion = motions[index];

          if (shell) {
            const x = side * 6 * (1 - eased);
            const y = 40 * (1 - eased);
            const z = -200 * (1 - eased);
            const rotateY = -side * 16 * (1 - eased);

            shell.style.opacity = eased.toFixed(4);
            shell.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(1)}px, ${z.toFixed(0)}px) rotateY(${rotateY.toFixed(2)}deg)`;
            shell.style.pointerEvents = eased > 0.35 ? "auto" : "none";
          }

          if (!motion) return;

          if (eased > 0 && !entered.has(index)) {
            entered.add(index);
            playFlourish(motion, index);
          } else if (eased === 0 && entered.has(index)) {
            entered.delete(index);
            resetMotion(motion);
          }
        });
      };

      const scheduleRefresh = () => {
        if (disposed) return;
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() => {
          measure();
          ScrollTrigger.refresh();
        });
      };

      const context = gsap.context(() => {
        measure();

        const tween = gsap.to(track, {
          x: () => -metrics.distance,
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${metrics.distance}`,
            scrub: 0.75,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onRefresh: (self) => updateCards(self.progress),
            onUpdate: (self) => updateCards(self.progress),
            onToggle: (self) => {
              section.classList.toggle("is-pinned", self.isActive);
            },
          },
        });

        window.addEventListener("resize", scheduleRefresh);

        const refreshOnce = () => {
          if (!disposed) ScrollTrigger.refresh();
        };

        refreshFrame = window.requestAnimationFrame(refreshOnce);
        void document.fonts?.ready.then(refreshOnce).catch(() => undefined);

        const trigger = tween.scrollTrigger;
        updateCards(trigger?.progress ?? 0);
      }, section);

      return () => {
        disposed = true;
        window.cancelAnimationFrame(resizeFrame);
        window.cancelAnimationFrame(refreshFrame);
        window.removeEventListener("resize", scheduleRefresh);
        section.classList.remove("is-pinned", "price--motion");
        pin.classList.remove("price__pin--motion");
        pin.style.removeProperty("height");
        entered.clear();
        shells.forEach((shell) => {
          if (!shell) return;
          shell.style.removeProperty("opacity");
          shell.style.removeProperty("transform");
          shell.style.removeProperty("pointer-events");
        });
        motions.forEach(resetMotion);
        context.revert();
      };
    });

    /* ---------------------------------------------------------------- */
    /* Mobile: no pin. Cards stack vertically and enter once on scroll.  */
    /* ---------------------------------------------------------------- */

    matchMedia.add(`${MOBILE_QUERY} and ${MOTION_QUERY}`, () => {
      const motions = Array.from(
        cardsRoot.querySelectorAll<HTMLElement>(".price__card-motion"),
      );

      const context = gsap.context(() => {
        gsap.fromTo(
          motions,
          {
            opacity: 0,
            y: 40,
            z: -160,
            rotationY: -8,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            z: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.06,
            clearProps: "opacity,transform",
            scrollTrigger: {
              trigger: cardsRoot,
              start: "top 88%",
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }, section);

      return () => context.revert();
    });

    return () => matchMedia.revert();
  }, []);

  return (
    <div className="price__pin" ref={pinRef}>
      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="price"
        ref={sectionRef}
      >
        <div className="price__lens" aria-hidden="true">
          {showLens ? (
            <Suspense fallback={null}>
              <LensDistortion
                insideSrc={ROSE_SRC}
                outsideSrc={ROSE_SRC}
                squareSize={0.4}
                desaturateOutside={false}
              />
            </Suspense>
          ) : null}
        </div>

        <div className="price__track" ref={trackRef}>
          <div className="price__heading">
            <RepeatedTextHeading />
          </div>

          <div className="price__cards" ref={cardsRef}>
            {PACKAGES.map((pkg) => (
              <div className="price__card" key={pkg.id}>
                <div className="price__card-shell">
                  <div className="price__card-motion">
                    <div className="price__card-float">
                      <PricingCard
                        name={pkg.name}
                        price={pkg.price}
                        features={pkg.features}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
