/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * One shared path for the camera, the cards and the pencil.
 *
 * Non-uniform Catmull-Rom (Hermite with finite-difference tangents) is used
 * because the knots sit at uneven progress values. The camera only needs the
 * x/y of the path at its own progress; each card sits at pathX(pathY) of the
 * progress where that card is focused. That is what keeps the pencil tip on
 * the card centres.
 */

import * as THREE from 'three';
import {
  CARD_ASPECT,
  CARD_COUNT,
  CARD_GAP,
  CARD_W_MAX,
  FOCUS_DISTANCE,
  FOV_RAD,
  LEAD,
} from './constants';

const BASE_X = [0, -0.9, 0.95, -0.85, 0.9, -0.4];
const BASE_Y = [0, 0.35, -0.25, 0.3, -0.2, 0.15];

// Mutable only so the dev-only tuning panel can rebuild the flight without a
// page reload. Production values are the constants above.
const tuning = {
  focusDistance: FOCUS_DISTANCE,
  cardGap: CARD_GAP,
  lead: LEAD,
};

let travel = (CARD_COUNT - 1) * tuning.cardGap + tuning.lead;

export const CARD_P = [];

export const KNOTS = BASE_X.map((x, index) => ({
  p: 0,
  x,
  y: BASE_Y[index],
}));

function syncDerived() {
  travel = (CARD_COUNT - 1) * tuning.cardGap + tuning.lead;

  CARD_P.length = 0;
  for (let i = 0; i < CARD_COUNT; i += 1) {
    CARD_P.push((tuning.lead + i * tuning.cardGap) / travel);
  }

  KNOTS[0].p = 0;
  for (let i = 0; i < CARD_COUNT; i += 1) {
    KNOTS[i + 1].p = CARD_P[i];
  }
}

syncDerived();

export function getTuning() {
  return { ...tuning };
}

export function getTravel() {
  return travel;
}

export function getCamZStart() {
  return tuning.focusDistance + tuning.lead;
}

export function setTuning(next = {}) {
  if (Number.isFinite(next.focusDistance)) {
    tuning.focusDistance = Math.max(1, Math.min(20, next.focusDistance));
  }
  if (Number.isFinite(next.cardGap)) {
    tuning.cardGap = Math.max(2, Math.min(20, next.cardGap));
  }
  if (Number.isFinite(next.lead)) {
    tuning.lead = Math.max(0, Math.min(20, next.lead));
  }
  syncDerived();
  return getTuning();
}

export function setKnotY(index, value) {
  if (!KNOTS[index] || !Number.isFinite(value)) return;
  KNOTS[index].y = value;
}

export function getKnotYs() {
  return KNOTS.map((knot) => knot.y);
}

export const camZ = (p) => getCamZStart() - p * travel;

export const tubeZ = (p) => camZ(p) - tuning.focusDistance;

export const cardZ = (index) => -index * tuning.cardGap;

// Non-uniform Catmull-Rom. The tangents use finite differences over the real
// knot spacing, so uneven knots do not overshoot or kink at the joins.
export function evalSpline(knots, key, t) {
  const n = knots.length;
  let i = 0;
  while (i < n - 2 && t > knots[i + 1].p) i += 1;

  const k0 = knots[i];
  const k1 = knots[i + 1];
  const km = knots[Math.max(i - 1, 0)];
  const k2 = knots[Math.min(i + 2, n - 1)];

  const h = k1.p - k0.p;
  const u = THREE.MathUtils.clamp((t - k0.p) / h, 0, 1);
  const m0 = (k1[key] - km[key]) / (k1.p - km.p);
  const m1 = (k2[key] - k0[key]) / (k2.p - k0.p);
  const u2 = u * u;
  const u3 = u2 * u;

  return (
    (2 * u3 - 3 * u2 + 1) * k0[key] +
    (u3 - 2 * u2 + u) * h * m0 +
    (-2 * u3 + 3 * u2) * k1[key] +
    (u3 - u2) * h * m1
  );
}

export let kx = 1;
export let ky = 1;
export let cardW = CARD_W_MAX;
export let cardH = CARD_W_MAX / CARD_ASPECT;

// Fit the zigzag and the card to the viewport. Called on mount and on resize.
export function fit(aspect) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  const halfH = tuning.focusDistance * Math.tan(FOV_RAD / 2);
  const halfW = halfH * safeAspect;

  cardW = Math.min(CARD_W_MAX, 1.56 * halfW);
  cardH = cardW / CARD_ASPECT;
  kx = THREE.MathUtils.clamp((halfW - cardW / 2 - 0.15) / 0.95, 0, 1);
  ky = THREE.MathUtils.clamp((halfH - cardH / 2 - 0.2) / 0.35, 0, 1);
}

export const pathX = (p) => kx * evalSpline(KNOTS, 'x', p);
export const pathY = (p) => ky * evalSpline(KNOTS, 'y', p);
