/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scroll-scrubbed portrait transition built from inline SVG masks. Each stage
 * change reveals the incoming portrait through a set of horizontal blind bars.
 * The bars open in sequence from top to bottom and are scrubbed directly by the
 * About section's GSAP ScrollTrigger progress.
 */

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface DissolveState {
  from: number;
  to: number;
  progress: number;
}

export interface PortraitDissolveHandle {
  render: (state: DissolveState) => void;
}

interface PortraitDissolveProps {
  sources: string[];
  alts: string[];
  activeIndex: number;
  className?: string;
}

const DESKTOP_BARS = 10;
const MOBILE_BARS = 6;
const BAR_STAGGER = 0.46;
const BAR_OVERLAP = 0.24;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

function blindsProgress(
  state: DissolveState,
  layer: number,
  reducedMotion: boolean,
  activeIndex: number,
) {
  if (reducedMotion) {
    return layer === 0
      ? activeIndex >= 1
        ? 1
        : 0
      : activeIndex >= 2
        ? 1
        : 0;
  }

  const target = layer + 1;
  if (state.to === target) return clamp01(state.progress);
  if (state.from >= target) return 1;
  return 0;
}

export const PortraitDissolve = forwardRef<
  PortraitDissolveHandle,
  PortraitDissolveProps
>(function PortraitDissolve(
  { sources, alts, activeIndex, className = "" },
  ref,
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [barCount, setBarCount] = useState(DESKTOP_BARS);
  const layerRefs = useRef<Array<SVGSVGElement | null>>([]);
  const barRefs = useRef<Array<Array<SVGRectElement | null>>>([]);
  const stateRef = useRef<DissolveState>({ from: 0, to: 0, progress: 0 });

  const paint = (state: DissolveState) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    for (let layer = 0; layer < 2; layer += 1) {
      const svg = layerRefs.current[layer];
      if (!svg) continue;

      const progress = blindsProgress(
        state,
        layer,
        reducedMotion,
        activeIndex,
      );
      svg.style.opacity = progress > 0 ? "1" : "0";

      const step = 100 / barCount;
      const fullHeight = step + step * BAR_OVERLAP;
      const delayStep =
        barCount > 1 ? BAR_STAGGER / (barCount - 1) : BAR_STAGGER;
      const duration = 1 - BAR_STAGGER;

      const bars = barRefs.current[layer] ?? [];
      bars.forEach((bar, index) => {
        if (!bar) return;
        const delay = index * delayStep;
        const local = clamp01((progress - delay) / duration);
        const height = fullHeight * easeOutCubic(local);
        const center = (index + 0.5) * step;
        bar.setAttribute("y", (center - height / 2).toFixed(4));
        bar.setAttribute("height", height.toFixed(4));
      });
    }
  };

  const render = (state: DissolveState) => {
    stateRef.current = state;
    paint(state);
  };

  useImperativeHandle(ref, () => ({ render }), [barCount, activeIndex]);

  useLayoutEffect(() => {
    paint(stateRef.current);
  });

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setBarCount(query.matches ? MOBILE_BARS : DESKTOP_BARS);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div
      className={`portrait-dissolve ${className}`}
      role="img"
      aria-label={alts[activeIndex] ?? alts[0]}
    >
      <img
        src={sources[0]}
        alt=""
        className="portrait-dissolve__base"
        draggable={false}
        loading="eager"
        fetchPriority="high"
      />

      {[0, 1].map((layer) => {
        const maskId = `portrait-blinds-${uid}-${layer}`;
        return (
          <svg
            key={maskId}
            ref={(element) => {
              layerRefs.current[layer] = element;
            }}
            className="portrait-dissolve__layer"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
            style={{ opacity: 0 }}
          >
            <defs>
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="100"
                height="100"
              >
                {Array.from({ length: barCount }, (_, index) => (
                  <rect
                    key={index}
                    ref={(element) => {
                      if (!barRefs.current[layer]) barRefs.current[layer] = [];
                      barRefs.current[layer][index] = element;
                    }}
                    x="0"
                    y={(index + 0.5) * (100 / barCount)}
                    width="100"
                    height="0"
                    fill="#ffffff"
                  />
                ))}
              </mask>
            </defs>

            <g mask={`url(#${maskId})`}>
              <foreignObject x="0" y="0" width="100" height="100">
                <div
                  // The SVG is stretched to the media box while this HTML layer
                  // keeps the exact object-fit / object-position crop used by
                  // the base portrait, so all three stages share a framing.
                  style={{ width: "100%", height: "100%" }}
                >
                  <img
                    src={sources[layer + 1]}
                    alt=""
                    draggable={false}
                    loading={layer === 0 ? "eager" : "lazy"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "50% 24%",
                      display: "block",
                    }}
                  />
                </div>
              </foreignObject>
            </g>
          </svg>
        );
      })}
    </div>
  );
});
