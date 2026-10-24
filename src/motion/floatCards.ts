/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Shared card entrance animation. Both AboutSection and PricingSection call
 * this single function so the float-in motion has one implementation and two
 * callers. Cards enter one at a time, alternating sides (left, right, …),
 * floating up on scroll with staggered timing.
 *
 * Driven by a ScrollTrigger progress value (0→1) mapped over a configurable
 * window. Each card translates from an offset and fades in with easeOutCubic.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface FloatCardsOptions {
  /** Array of card DOM elements to animate. */
  cards: HTMLElement[];
  /** ScrollTrigger instance that provides progress (0→1). */
  trigger: ScrollTrigger;
  /** Progress value where the first card begins to enter. Default 0.02. */
  enterStart?: number;
  /** Progress value where the last card finishes entering. Default 0.12. */
  enterEnd?: number;
  /** Progress value where cards begin to exit. Set 0 to skip exit. Default 0. */
  exitStart?: number;
  /** Progress value where cards finish exiting. Default 0. */
  exitEnd?: number;
  /** Horizontal offset in vw per side. Default 12. */
  xOffset?: number;
  /** Vertical offset in px. Default 40. */
  yOffset?: number;
  /** Initial rotation in degrees. Default 6. */
  rotation?: number;
  /** Initial Z depth in px. Default -200. */
  zOffset?: number;
}

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value: number) => Math.pow(value, 3);
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Animate a set of cards floating in on scroll. Returns a cleanup function
 * that kills the ScrollTrigger listener. Call it on unmount.
 */
export function floatCardsIn({
  cards,
  trigger,
  enterStart = 0.02,
  enterEnd = 0.12,
  exitStart = 0,
  exitEnd = 0,
  xOffset = 12,
  yOffset = 40,
  rotation = 6,
  zOffset = -200,
}: FloatCardsOptions): () => void {
  const canExit = exitStart > 0;
  const perCard = (enterEnd - enterStart) / Math.max(1, cards.length);

  const apply = (progress: number) => {
    cards.forEach((card, index) => {
      const side = index % 2 === 0 ? -1 : 1;

      const cardEnterStart = enterStart + index * perCard;
      const cardEnterEnd = cardEnterStart + perCard;
      const entryProgress = clamp01(
        (progress - cardEnterStart) / Math.max(0.001, cardEnterEnd - cardEnterStart),
      );

      const entering = easeOutCubic(entryProgress);

      let exiting = 0;
      if (canExit) {
        const cardExitStart = exitStart + index * perCard * 0.5;
        const cardExitEnd = cardExitStart + perCard;
        const exitProgress = clamp01(
          (progress - cardExitStart) / Math.max(0.001, cardExitEnd - cardExitStart),
        );
        exiting = easeInCubic(exitProgress);
      }

      const travel = canExit && exiting > 0 ? 1 - exiting : entering;
      const opacity = entering * (1 - exiting);

      const x = side * xOffset * (1 - travel);
      const y = yOffset * (1 - travel);
      const z = zOffset * (1 - travel);
      const rot = side * rotation * (1 - travel);

      card.style.opacity = opacity.toFixed(4);
      card.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(1)}px, ${z.toFixed(0)}px) rotateY(${rot.toFixed(2)}deg)`;
      card.style.pointerEvents = opacity > 0.35 ? "auto" : "none";
    });
  };

  // Initial call
  apply(clamp01(trigger.progress));

  const st = ScrollTrigger.create({
    trigger: trigger.trigger,
    start: trigger.start,
    end: trigger.end,
    scrub: true,
    onUpdate: (self) => apply(clamp01(self.progress)),
  });

  return () => st.kill();
}
