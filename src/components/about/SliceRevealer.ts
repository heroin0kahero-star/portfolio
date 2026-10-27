/**
 * GSAP port of Codrops SliceRevealer's uncover.js.
 *
 * The overlay is a stack of full-size colour bands. Covering slides them in
 * from one edge; revealing slides them out toward another. Only xPercent /
 * yPercent are animated so the browser can keep the whole transition on the
 * compositor. Bands are created once by React and reused for every stage pair.
 */

import gsap from "gsap";
import type { SliceEdge, SlicePreset } from "./slicePresets";

export const MAX_SLICE_BANDS = 8;

function coverStart(edge: SliceEdge) {
  return edge === "left" || edge === "top" ? -100 : 100;
}

function revealEnd(edge: SliceEdge) {
  return edge === "right" || edge === "bottom" ? 100 : -100;
}

function staggerDelay(
  timing: { delay: (index: number, total: number) => number },
) {
  return (index: number, _target: object, list: object[] | NodeList) =>
    timing.delay(index, list.length);
}

export class SliceRevealer {
  private overlay: HTMLElement;
  private layer: HTMLElement;
  private bands: HTMLElement[];
  private activeBands: HTMLElement[] = [];
  private pendingResolve: (() => void) | null = null;
  private destroyed = false;

  constructor(
    overlay: HTMLElement,
    layer: HTMLElement,
    bands: readonly HTMLElement[],
  ) {
    this.overlay = overlay;
    this.layer = layer;
    this.bands = bands.slice(0, MAX_SLICE_BANDS);
  }

  private settle() {
    const resolve = this.pendingResolve;
    this.pendingResolve = null;
    resolve?.();
  }

  private configure(preset: SlicePreset, color: string) {
    const vertical = preset.orientation === "vertical";

    this.layer.classList.toggle(
      "about-slice-overlay__bands--vertical",
      vertical,
    );
    this.layer.classList.toggle(
      "about-slice-overlay__bands--horizontal",
      !vertical,
    );

    const count = Math.min(preset.bands, this.bands.length);
    this.activeBands = this.bands.slice(0, count);

    this.bands.forEach((band, index) => {
      const active = index < count;
      band.style.display = active ? "block" : "none";
      if (!active) return;
      band.style.color = color;
      band.style.backgroundColor = color;
    });

    this.overlay.dataset.visible = "true";
    this.overlay.classList.add("is-animating");
  }

  /** Slide the bands in until the section is fully hidden. */
  cover(preset: SlicePreset, color: string): Promise<void> {
    if (this.destroyed) return Promise.resolve();

    this.configure(preset, color);

    const vertical = preset.orientation === "vertical";
    const start = coverStart(preset.coverFrom);

    gsap.killTweensOf(this.bands);
    gsap.set(this.bands, { xPercent: 0, yPercent: 0 });
    gsap.set(
      this.activeBands,
      vertical
        ? { xPercent: 0, yPercent: start }
        : { xPercent: start, yPercent: 0 },
    );

    return new Promise<void>((resolve) => {
      this.pendingResolve = resolve;
      gsap.to(this.activeBands, {
        xPercent: 0,
        yPercent: 0,
        duration: preset.cover.duration,
        ease: preset.cover.ease,
        stagger: staggerDelay(preset.cover),
        overwrite: true,
        onComplete: () => this.settle(),
      });
    });
  }

  /** Slide the bands out and uncover the incoming stage. */
  reveal(preset: SlicePreset): Promise<void> {
    if (this.destroyed) return Promise.resolve();

    const vertical = preset.orientation === "vertical";
    const end = revealEnd(preset.revealTo);
    const start = coverStart(preset.coverFrom);

    return new Promise<void>((resolve) => {
      this.pendingResolve = resolve;
      gsap.to(this.activeBands, {
        xPercent: vertical ? 0 : end,
        yPercent: vertical ? end : 0,
        duration: preset.reveal.duration,
        ease: preset.reveal.ease,
        stagger: staggerDelay(preset.reveal),
        overwrite: true,
        onComplete: () => {
          this.overlay.dataset.visible = "false";
          this.overlay.classList.remove("is-animating");
          // Leave the bands parked at the cover start so a visibility glitch
          // can never flash them across the section.
          gsap.set(
            this.activeBands,
            vertical
              ? { xPercent: 0, yPercent: start }
              : { xPercent: start, yPercent: 0 },
          );
          this.settle();
        },
      });
    });
  }

  /** Hide the overlay and release any pending cover/reveal promise. */
  cancel() {
    gsap.killTweensOf(this.bands);
    this.hide();
    this.settle();
  }

  /** Hide the overlay immediately (reduced motion / teardown). */
  hide() {
    this.overlay.dataset.visible = "false";
    this.overlay.classList.remove("is-animating");
  }

  destroy() {
    this.destroyed = true;
    gsap.killTweensOf(this.bands);
    this.overlay.classList.remove("is-animating");
    this.overlay.dataset.visible = "false";
    this.settle();
    this.bands.forEach((band) => {
      band.style.removeProperty("display");
      band.style.removeProperty("color");
      band.style.removeProperty("background-color");
    });
    gsap.set(this.bands, { clearProps: "transform" });
  }
}
