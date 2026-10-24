/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Repeated-text heading rows for the Pricing section, built from scratch on
 * the Codrops "Text Repetition Scroll Effect" idea: oversized repeated copy,
 * duplicated halves for a seamless loop, and alternating scroll-linked
 * horizontal travel.
 *
 * The visible rows are decorative (aria-hidden). A visually hidden h2 carries
 * the real heading so screen readers hear the phrase once, not 16 times.
 */

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADING_TEXT = "Clear pricing, no surprises";
const REPEATS_PER_HALF = 2;

interface RowConfig {
  /** -1 travels left as the page scrolls down, 1 travels right. */
  direction: -1 | 1;
  speed: number;
}

const ROWS: RowConfig[] = [
  { direction: -1, speed: 0.6 },
  { direction: 1, speed: 0.9 },
  { direction: -1, speed: 0.7 },
  { direction: 1, speed: 1.1 },
];

function RowHalf({ copyIndex }: { copyIndex: number }) {
  return (
    <div className="pricing-row__half" aria-hidden="true">
      {Array.from({ length: REPEATS_PER_HALF }).map((_, repeat) => (
        <span className="pricing-row__item" key={`${copyIndex}-${repeat}`}>
          <span>{HEADING_TEXT}</span>
          <span className="pricing-row__dot" />
        </span>
      ))}
    </div>
  );
}

export function RepeatedTextHeading() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const tracks = Array.from(
      root.querySelectorAll<HTMLElement>(".pricing-row__track"),
    );
    const mm = gsap.matchMedia();

    const build = (rowIndexes: number[]) => {
      const tweens: gsap.core.Tween[] = [];

      rowIndexes.forEach((rowIndex) => {
        const track = tracks[rowIndex];
        const config = ROWS[rowIndex];
        if (!track || !config) return;

        const halfWidth = () =>
          (track.firstElementChild as HTMLElement | null)?.offsetWidth ??
          window.innerWidth;
        const travel = () => window.innerWidth * 0.34 * config.speed;

        tweens.push(
          gsap.fromTo(
            track,
            {
              x: () =>
                -halfWidth() - (travel() / 2) * config.direction,
            },
            {
              x: () =>
                -halfWidth() + (travel() / 2) * config.direction,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
                invalidateOnRefresh: true,
                onToggle: (self) => {
                  track.style.willChange = self.isActive ? "transform" : "auto";
                },
              },
            },
          ),
        );
      });

      return () => {
        tweens.forEach((tween) => tween.kill());
      };
    };

    // All four rows stay visible at every breakpoint.
    mm.add("(min-width: 768px)", () => build([0, 1, 2, 3]));
    mm.add("(max-width: 767px)", () => build([0, 1, 2, 3]));

    // Web fonts change the phrase width; re-measure once they settle.
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      mm.revert();
      tracks.forEach((track) => {
        track.style.willChange = "auto";
      });
    };
  }, []);

  return (
    <div className="pricing-heading" ref={rootRef}>
      <h2 id="pricing-heading" className="sr-only">
        {HEADING_TEXT}
      </h2>

      {ROWS.map((_, index) => (
        <div key={index} className="pricing-row" aria-hidden="true">
          <div className="pricing-row__track" data-row={index}>
            <RowHalf copyIndex={index} />
            <RowHalf copyIndex={index} />
          </div>
        </div>
      ))}
    </div>
  );
}
