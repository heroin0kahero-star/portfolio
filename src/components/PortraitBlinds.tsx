/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Three stacked portraits with a scroll-scrubbed horizontal-blind transition.
 * The outgoing portrait is rendered as horizontal bands; each band opens from
 * its centre line outward with a scaleY transform while the image inside is
 * counter-scaled, so the reveal is transform-only (no clip-path repaint) and
 * the portraits can never stretch or squash.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface BlindsState {
  from: number;
  to: number;
  progress: number;
}

export interface PortraitBlindsHandle {
  render: (state: BlindsState) => void;
  preload: (index: number) => void;
}

interface PortraitBlindsProps {
  sources: readonly string[];
  srcSets?: readonly string[];
  sizes?: string;
  alts: readonly string[];
  activeIndex: number;
}

const STAGGER = 0.05;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const stripeCountForViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 1023px)").matches
    ? 6
    : 10;

export const PortraitBlinds = forwardRef<
  PortraitBlindsHandle,
  PortraitBlindsProps
>(function PortraitBlinds(
  { sources, srcSets, sizes, alts, activeIndex },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<Array<HTMLImageElement | null>>([]);
  const groupRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stripeRefs = useRef<Array<Array<HTMLDivElement | null>>>([]);
  const stripeImageRefs = useRef<Array<Array<HTMLImageElement | null>>>([]);
  const decodedRef = useRef<Set<number>>(new Set());
  const stateRef = useRef<BlindsState>({
    from: activeIndex,
    to: activeIndex,
    progress: 0,
  });
  const [stripeCount, setStripeCount] = useState(stripeCountForViewport);

  // Fewer bands on phones means fewer composited layers to transform.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const handleChange = () => setStripeCount(query.matches ? 6 : 10);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const preload = useCallback((index: number) => {
    const image = layerRefs.current[index];
    if (!image || decodedRef.current.has(index)) return;

    const markDecoded = () => decodedRef.current.add(index);
    const decode = () => {
      if (typeof image.decode !== "function") {
        if (image.complete) markDecoded();
        return;
      }
      image.decode().then(markDecoded).catch(() => {
        // Not ready yet; the load handler retries once.
      });
    };

    if (image.complete) decode();
    else image.addEventListener("load", decode, { once: true });
  }, []);

  const paint = (state: BlindsState) => {
    stateRef.current = state;
    const transitioning = state.from !== state.to;
    const running =
      transitioning && state.progress > 0 && state.progress < 1;
    const visibleLayer = transitioning ? state.to : state.from;

    rootRef.current?.classList.toggle(
      "portrait-blinds--transitioning",
      running,
    );

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
      const images = stripeImageRefs.current[groupIndex] ?? [];

      stripes.forEach((stripe, stripeIndex) => {
        if (!stripe) return;
        const duration = 1 - STAGGER * (stripeCount - 1);
        const local = clamp01(
          (state.progress - stripeIndex * STAGGER) / duration,
        );
        const eased = easeInOutCubic(local);
        // Keep the scale non-zero so the counter-scale stays finite; a band
        // this thin is already invisible.
        const scale = Math.max(eased, 0.0001);

        stripe.style.transform = `scaleY(${scale.toFixed(4)})`;

        const image = images[stripeIndex];
        if (image) {
          image.style.transform = `translateY(-${((stripeIndex * 100) / stripeCount).toFixed(4)}%) scaleY(${(1 / scale).toFixed(4)})`;
        }
      });
    });
  };

  useImperativeHandle(
    ref,
    () => ({ render: paint, preload }),
    [preload, stripeCount],
  );

  // Keep the latest active stage visible if React re-renders without a scroll
  // update (for example when the media query or reduced-motion state changes).
  useLayoutEffect(() => {
    paint(stateRef.current);
  }, [stripeCount]);

  useEffect(() => {
    preload(activeIndex);
    preload((activeIndex + 1) % sources.length);
  }, [activeIndex, preload, sources.length]);

  return (
    <div
      ref={rootRef}
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
          srcSet={srcSets?.[index]}
          sizes={sizes}
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
          {Array.from({ length: stripeCount }, (_, stripeIndex) => (
            <div
              key={stripeIndex}
              ref={(element) => {
                if (!stripeRefs.current[from]) stripeRefs.current[from] = [];
                stripeRefs.current[from][stripeIndex] = element;
              }}
              className="about-portrait__blind"
              style={{
                top: `${(stripeIndex * 100) / stripeCount}%`,
                height: `${100 / stripeCount}%`,
              }}
            >
              <img
                ref={(element) => {
                  if (!stripeImageRefs.current[from]) {
                    stripeImageRefs.current[from] = [];
                  }
                  stripeImageRefs.current[from][stripeIndex] = element;
                }}
                src={sources[from]}
                srcSet={srcSets?.[from]}
                sizes={sizes}
                alt=""
                draggable={false}
                decoding="async"
                loading="eager"
                className="about-portrait__blind-image"
                style={{
                  height: `${stripeCount * 100}%`,
                  transform: `translateY(-${((stripeIndex * 100) / stripeCount).toFixed(4)}%)`,
                  transformOrigin: `50% ${(((stripeIndex + 0.5) * 100) / stripeCount).toFixed(4)}%`,
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});
