/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Three stacked portraits with a scroll-scrubbed horizontal-blind transition.
 * The outgoing portrait is rendered as ten horizontal bands; each band opens
 * from its centre line outward using clip-path: inset(...), revealing the
 * incoming portrait underneath. No scale is applied to any element that
 * contains an image, so the portraits can never stretch or squash.
 */

import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";

export interface BlindsState {
  from: number;
  to: number;
  progress: number;
}

export interface PortraitBlindsHandle {
  render: (state: BlindsState) => void;
}

interface PortraitBlindsProps {
  sources: readonly string[];
  alts: readonly string[];
  activeIndex: number;
}

const STRIPES = 10;
const STAGGER = 0.05;
const DURATION = 1 - STAGGER * (STRIPES - 1);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const PortraitBlinds = forwardRef<
  PortraitBlindsHandle,
  PortraitBlindsProps
>(function PortraitBlinds({ sources, alts, activeIndex }, ref) {
  const layerRefs = useRef<Array<HTMLImageElement | null>>([]);
  const groupRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stripeRefs = useRef<Array<Array<HTMLDivElement | null>>>([]);
  const stateRef = useRef<BlindsState>({
    from: activeIndex,
    to: activeIndex,
    progress: 0,
  });

  const paint = (state: BlindsState) => {
    stateRef.current = state;
    const transitioning = state.from !== state.to;
    const visibleLayer = transitioning ? state.to : state.from;

    layerRefs.current.forEach((layer, index) => {
      if (!layer) return;
      layer.style.opacity = index === visibleLayer ? "1" : "0";
    });

    groupRefs.current.forEach((group, groupIndex) => {
      if (!group) return;
      const isActive = transitioning && groupIndex === state.from;
      group.style.display = isActive ? "block" : "none";
      if (!isActive) return;

      const stripes = stripeRefs.current[groupIndex] ?? [];
      stripes.forEach((stripe, stripeIndex) => {
        if (!stripe) return;
        const local = clamp01(
          (state.progress - stripeIndex * STAGGER) / DURATION,
        );
        const eased = easeInOutCubic(local);
        // Each band opens from its centre line outward.
        // Closed: inset(mid% 0 100-mid% 0) → Open: inset(top% 0 100-bottom% 0)
        const bandTop = stripeIndex * (100 / STRIPES);
        const bandBottom = 100 - bandTop - 100 / STRIPES;
        // When eased=0 (closed): top=mid, bottom=100-mid (fully collapsed)
        // When eased=1 (open): top=bandTop, bottom=bandBottom (full strip)
        const openTop = bandTop + (100 / STRIPES) * (1 - eased) / 2;
        const openBottom = bandBottom - (100 / STRIPES) * (1 - eased) / 2;
        stripe.style.clipPath = `inset(${openTop.toFixed(2)}% 0 ${openBottom.toFixed(2)}% 0)`;
      });
    });
  };

  useImperativeHandle(ref, () => ({ render: paint }));

  // Keep the latest active stage visible if React re-renders without a scroll
  // update (for example when the media query or reduced-motion state changes).
  useLayoutEffect(() => {
    paint(stateRef.current);
  }, []);

  return (
    <div
      className="portrait-blinds"
      role="img"
      aria-label={alts[activeIndex] ?? alts[0]}
    >
      {sources.map((source, index) => (
        <img
          key={source}
          ref={(element) => {
            layerRefs.current[index] = element;
          }}
          src={source}
          alt=""
          className="about-portrait__layer"
          draggable={false}
          decoding="async"
          loading="eager"
          style={{ opacity: index === activeIndex ? 1 : 0 }}
        />
      ))}

      {[0, 1].map((from) => (
        <div
          key={`blinds-${from}`}
          ref={(element) => {
            groupRefs.current[from] = element;
          }}
          className="about-portrait__blinds"
          style={{ display: "none" }}
          aria-hidden="true"
        >
          {Array.from({ length: STRIPES }, (_, stripeIndex) => (
            <div
              key={stripeIndex}
              ref={(element) => {
                if (!stripeRefs.current[from]) stripeRefs.current[from] = [];
                stripeRefs.current[from][stripeIndex] = element;
              }}
              className="about-portrait__blind"
              style={{ top: `${stripeIndex * (100 / STRIPES)}%` }}
            >
              <img
                src={sources[from]}
                alt=""
                draggable={false}
                decoding="async"
                loading="eager"
                className="about-portrait__blind-image"
                style={{ transform: `translateY(-${stripeIndex * 10}%)` }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});
