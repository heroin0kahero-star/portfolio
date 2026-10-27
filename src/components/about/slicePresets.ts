/**
 * Slice transition presets, ported from Codrops SliceRevealer
 * (js/demo2.js, js/demo3.js and js/uncover.js).
 *
 * Times are converted from milliseconds to seconds. Anything the demos do not
 * specify falls back to uncover.js defaults: 800ms, delay i*80, easeInOutQuart.
 */

export type SliceOrientation = "horizontal" | "vertical";
export type SliceEdge = "left" | "right" | "top" | "bottom";

export interface SliceTiming {
  duration: number;
  ease: string;
  /** index = slice index, total = number of slices in this transition. */
  delay: (index: number, total: number) => number;
}

export interface SlicePreset {
  orientation: SliceOrientation;
  bands: number;
  coverFrom: SliceEdge;
  revealTo: SliceEdge;
  cover: SliceTiming;
  reveal: SliceTiming;
}

export const presets = {
  leftToRight: {
    // demo2.js, origins flipped so the sweep travels left -> right.
    orientation: "horizontal", // bands are rows that slide sideways
    bands: 8, // demo2 uses 8 to 11; 8 is the mobile-safe count
    coverFrom: "left", // cover: bands enter from the left edge
    revealTo: "right", // reveal: bands exit to the right edge
    cover: { duration: 0.6, ease: "circ.inOut", delay: (i: number) => i * 0.05 },
    reveal: {
      duration: 0.6,
      ease: "circ.inOut",
      delay: (i: number) => i * 0.05,
    },
  },
  upToDown: {
    // demo3.js slide 0, origins flipped so the sweep travels top -> bottom.
    orientation: "vertical", // bands are columns that slide up or down
    bands: 5,
    coverFrom: "top",
    revealTo: "bottom",
    cover: {
      duration: 0.6,
      ease: "circ.inOut",
      delay: (i: number, t: number) => (t - i - 1) * 0.1,
    },
    reveal: {
      duration: 0.6,
      ease: "circ.inOut",
      delay: (i: number, t: number) => (t - i - 1) * 0.1,
    },
  },
  centerOut: {
    // demo3.js slide 1, unchanged: bands in the middle move first.
    orientation: "horizontal",
    bands: 8,
    coverFrom: "left",
    revealTo: "left",
    cover: {
      duration: 0.3,
      ease: "quart.inOut",
      delay: (i: number, t: number) => Math.abs(t / 2 - i) * 0.04,
    },
    reveal: {
      duration: 0.6,
      ease: "circ.inOut",
      delay: (i: number, t: number) => Math.abs(t / 2 - i) * 0.08,
    },
  },
} satisfies Record<string, SlicePreset>;

export type SlicePresetName = keyof typeof presets;

/**
 * Band colour is the incoming stage's colour. Stage 2 is sampled from the red
 * portrait's painted background (#660104). The Codrops demo's #d60b3f does not
 * match this artwork.
 */
export const STAGE_BAND_COLORS = ["#ffffff", "#660104", "#111111"] as const;

/**
 * One place to change which preset a stage pair uses. Pairs are normalised, so
 * the same preset is used in both directions.
 *
 * 0 -> 1 / 1 -> 0 : leftToRight
 * 1 -> 2 / 2 -> 1 : upToDown
 * 0 -> 2 / 2 -> 0 : centerOut (a jump that skips the middle stage)
 */
export const SLICE_TRANSITIONS: Record<string, SlicePreset> = {
  "0-1": presets.leftToRight,
  "1-2": presets.upToDown,
  "0-2": presets.centerOut,
};

export function transitionFor(from: number, to: number): SlicePreset {
  const key = `${Math.min(from, to)}-${Math.max(from, to)}`;
  return SLICE_TRANSITIONS[key] ?? presets.centerOut;
}
