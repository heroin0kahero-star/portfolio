/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * "Price" heading with the Codrops "Text Repetition Scroll Effect" (demo 3)
 * translated into a React-friendly helper. The last copy is solid; the eight
 * copies behind it are outlined and translate vertically on a scroll-scrubbed
 * GSAP timeline.
 */

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const TOTAL = 9;
const TY_INC = 14;
const DELAY_INC = 0.08;

/**
 * Port of src/js/demo3/repeatTextScrollFx.js. Returns a cleanup function that
 * restores the original markup (React StrictMode mounts effects twice).
 */
export function initRepeatText(el: HTMLElement): () => void {
  const source = el.dataset.repSource ?? el.innerHTML;
  el.dataset.repSource = source;

  const half = Math.floor(TOTAL / 2);
  let html = "";

  for (let i = 0; i < TOTAL; i++) {
    let ty: number;
    let delay: number;

    if (i === TOTAL - 1) {
      ty = 0;
      delay = 0;
    } else if (i < half) {
      ty = half * TY_INC - TY_INC * i;
      delay = DELAY_INC * (half - i) - DELAY_INC;
    } else {
      const j = i - half;
      ty = -(half * TY_INC - j * TY_INC);
      delay = DELAY_INC * (half - j) - DELAY_INC;
    }

    html += `<span data-ty="${ty}" data-delay="${delay}" aria-hidden="true">${source}</span>`;
  }

  el.innerHTML = html;
  el.classList.add("text-rep");

  const copies = [...el.querySelectorAll<HTMLElement>("span")];
  const outlines = copies.slice(0, -1);

  // Reserve room for the translated copies. Using one copy's height means the
  // padding stays stable through font swaps and resize.
  const setPad = () => {
    const copyH = copies[0]?.offsetHeight ?? 0;
    const pad = (copyH * half * TY_INC) / 100;
    gsap.set(el, { marginTop: pad, paddingBottom: pad });
  };
  setPad();
  window.addEventListener("resize", setPad);

  const tl = gsap
    .timeline({ paused: true })
    .to(
      outlines,
      {
        duration: 1,
        ease: "none",
        startAt: { opacity: 0 },
        opacity: 1,
        yPercent: (_, target) => Number(target.dataset.ty),
        delay: (_, target) => Number(target.dataset.delay),
      },
      0,
    )
    .to(outlines, {
      duration: 1,
      ease: "none",
      opacity: 0,
      yPercent: 0,
      delay: (_, target) => Number(target.dataset.delay),
    });

  // 0 when the heading enters at the bottom of the viewport, 1 when it leaves
  // the top.
  const tick = () => {
    const rect = el.getBoundingClientRect();
    const progress =
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    tl.progress(Math.min(1, Math.max(0, progress)));
  };

  gsap.ticker.add(tick);
  tick();

  const fontsReady = document.fonts?.ready.then(() => setPad());

  return () => {
    window.removeEventListener("resize", setPad);
    gsap.ticker.remove(tick);
    tl.kill();
    void fontsReady;
    el.innerHTML = source;
    el.classList.remove("text-rep");
    gsap.set(el, { clearProps: "marginTop,paddingBottom" });
  };
}

export function RepeatedTextHeading() {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initRepeatText(el);
  }, []);

  return (
    <h2
      id="pricing-heading"
      ref={headingRef}
      className="price__title"
      data-text-rep
      aria-label="Price"
    >
      Price
    </h2>
  );
}
