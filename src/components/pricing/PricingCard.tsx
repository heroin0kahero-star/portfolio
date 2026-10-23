/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * A package card with three stacked transform layers:
 *   1. .pricing-card        resting depth (translateZ + rotateY), from CSS
 *   2. .pricing-card__float idle bob, CSS keyframes
 *   3. .pricing-card__tilt  cursor tilt, GSAP quickTo (fine pointers only)
 *
 * Keeping the layers separate means the hover tilt never overwrites the
 * resting 3D placement and the float never fights the pointer transform.
 */

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { CheckCircle } from "lucide-react";
import gsap from "gsap";

const MAX_TILT = 8;
const TILT_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

interface PricingCardProps {
  name: string;
  price: string;
  blurb: string;
  features: string[];
  active: boolean;
  onSelect: () => void;
}

export function PricingCard({
  name,
  price,
  blurb,
  features,
  active,
  onSelect,
}: PricingCardProps) {
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const quickRef = useRef<{
    rotateX: gsap.QuickToFunc;
    rotateY: gsap.QuickToFunc;
  } | null>(null);
  const tiltEnabled = useRef(false);
  const willChangeTimer = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia(TILT_QUERY);
    const sync = () => {
      tiltEnabled.current = query.matches;
      if (!query.matches && tiltRef.current) {
        gsap.set(tiltRef.current, { rotateX: 0, rotateY: 0 });
        tiltRef.current.style.willChange = "auto";
      }
    };

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;

    quickRef.current = {
      rotateX: gsap.quickTo(el, "rotationX", {
        duration: 0.45,
        ease: "power3.out",
      }),
      rotateY: gsap.quickTo(el, "rotationY", {
        duration: 0.45,
        ease: "power3.out",
      }),
    };

    return () => {
      gsap.killTweensOf(el);
      quickRef.current = null;
      if (willChangeTimer.current !== null) {
        window.clearTimeout(willChangeTimer.current);
      }
    };
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    const quick = quickRef.current;
    if (!tiltEnabled.current || !el || !quick) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Normalised -1..1 from the card centre.
    const dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    el.style.willChange = "transform";
    // Negative rotateY brings the cursor side of the card toward the viewer.
    quick.rotateY(-dx * MAX_TILT);
    quick.rotateX(dy * MAX_TILT);
  };

  const handlePointerLeave = () => {
    const el = tiltRef.current;
    const quick = quickRef.current;
    if (!el || !quick) return;

    quick.rotateX(0);
    quick.rotateY(0);

    if (willChangeTimer.current !== null) {
      window.clearTimeout(willChangeTimer.current);
    }
    willChangeTimer.current = window.setTimeout(() => {
      el.style.willChange = "auto";
    }, 500);
  };

  return (
    <div className="pricing-card">
      <div className="pricing-card__float">
        <div
          className="pricing-card__tilt"
          ref={tiltRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
        >
          <article
            className={`pricing-card__body${active ? " is-active" : ""}`}
            aria-labelledby={`pricing-card-${name.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <span className="pricing-card__accent" aria-hidden="true" />

            <h3
              id={`pricing-card-${name.replace(/\s+/g, "-").toLowerCase()}`}
              className="pricing-card__name"
            >
              {name}
            </h3>
            <p className="pricing-card__blurb">{blurb}</p>

            <div className="pricing-card__price-block">
              <span className="pricing-card__price">{price}</span>
              <span className="pricing-card__note">
                One-time project estimate
              </span>
            </div>

            <ul className="pricing-card__features">
              {features.map((line) => (
                <li key={line} className="pricing-card__feature">
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onSelect}
              aria-pressed={active}
              className={`pricing-card__button${active ? " is-selected" : ""}`}
            >
              {active ? <CheckCircle aria-hidden="true" size={15} /> : null}
              {active ? "Package selected" : "Select this package"}
            </button>
          </article>
        </div>
      </div>
    </div>
  );
}
