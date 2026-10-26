/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The flight is only correct if the camera, the cards and the pencil all agree
 * on the same progress values. These tests pin that contract down.
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
  CARD_P,
  KNOTS,
  camZ,
  cardZ,
  evalSpline,
  fit,
  getTuning,
  getTravel,
  kx,
  ky,
  pathX,
  pathY,
  setKnotY,
  setTuning,
  tubeZ,
} from './path';

const BASE_TUNING = { focusDistance: 6, cardGap: 7, lead: 4 };
const BASE_KNOTS = [0, 0.35, -0.25, 0.3, -0.2, 0.15];

afterEach(() => {
  setTuning(BASE_TUNING);
  BASE_KNOTS.forEach((value, index) => setKnotY(index, value));
  fit(16 / 9);
});

describe('card progress', () => {
  it('puts five cards at the authored progress values', () => {
    expect(CARD_P).toHaveLength(5);
    expect(CARD_P[0]).toBeCloseTo(0.125, 10);
    expect(CARD_P[1]).toBeCloseTo(0.34375, 10);
    expect(CARD_P[2]).toBeCloseTo(0.5625, 10);
    expect(CARD_P[3]).toBeCloseTo(0.78125, 10);
    expect(CARD_P[4]).toBeCloseTo(1, 10);
  });

  it('keeps the progress values strictly increasing', () => {
    for (let index = 1; index < CARD_P.length; index += 1) {
      expect(CARD_P[index]).toBeGreaterThan(CARD_P[index - 1]);
    }
  });

  it('exposes the same mutable array after retuning', () => {
    const reference = CARD_P;
    setTuning({ focusDistance: 8, cardGap: 10, lead: 2 });
    expect(reference).toBe(CARD_P);
    expect(CARD_P).toHaveLength(5);
  });
});

describe('camera, cards and pencil', () => {
  it('places card i exactly FOCUS_DISTANCE in front of the camera at focus', () => {
    CARD_P.forEach((progress, index) => {
      expect(camZ(progress) - cardZ(index)).toBeCloseTo(6, 10);
    });
  });

  it('puts the pencil tip on the card plane at every focus', () => {
    CARD_P.forEach((progress, index) => {
      expect(tubeZ(progress)).toBeCloseTo(cardZ(index), 10);
    });
  });

  it('starts the camera 4 units before card 01 and ends at z = -22', () => {
    expect(getTravel()).toBe(32);
    expect(camZ(0)).toBeCloseTo(10, 10);
    expect(camZ(1)).toBeCloseTo(-22, 10);
    expect(tubeZ(0)).toBeCloseTo(4, 10);
    expect(tubeZ(1)).toBeCloseTo(-28, 10);
  });

  it('keeps the four-unit lead-in ahead of the first card', () => {
    expect(camZ(0) - cardZ(0)).toBeCloseTo(10, 10);
    expect(getTuning().lead).toBe(4);
  });
});

describe('spline evaluation', () => {
  it('passes through every knot', () => {
    KNOTS.forEach((knot) => {
      expect(evalSpline(KNOTS, 'x', knot.p)).toBeCloseTo(knot.x, 10);
      expect(evalSpline(KNOTS, 'y', knot.p)).toBeCloseTo(knot.y, 10);
    });
  });

  it('clamps outside the knot range', () => {
    expect(evalSpline(KNOTS, 'x', -1)).toBeCloseTo(KNOTS[0].x, 10);
    expect(evalSpline(KNOTS, 'x', 2)).toBeCloseTo(KNOTS[KNOTS.length - 1].x, 10);
  });

  it('scales the path through the fitted viewport', () => {
    fit(16 / 9);
    const scaleX = kx;
    const scaleY = ky;

    expect(scaleX).toBeGreaterThan(0);
    expect(scaleX).toBeLessThanOrEqual(1);
    expect(scaleY).toBeGreaterThan(0);
    expect(scaleY).toBeLessThanOrEqual(1);
    KNOTS.forEach((knot) => {
      expect(pathX(knot.p)).toBeCloseTo(scaleX * knot.x, 10);
      expect(pathY(knot.p)).toBeCloseTo(scaleY * knot.y, 10);
    });
  });
});

describe('tuning', () => {
  it('re-syncs travel, card progress and knot progress together', () => {
    setTuning({ focusDistance: 8, cardGap: 10, lead: 2 });

    expect(getTravel()).toBe(42);
    expect(CARD_P[0]).toBeCloseTo(2 / 42, 10);
    expect(CARD_P[4]).toBeCloseTo(1, 10);
    expect(KNOTS[0].p).toBe(0);
    CARD_P.forEach((progress, index) => {
      expect(KNOTS[index + 1].p).toBeCloseTo(progress, 10);
    });
    expect(camZ(0)).toBeCloseTo(10, 10);
    expect(camZ(1)).toBeCloseTo(-32, 10);
    expect(tubeZ(1)).toBeCloseTo(-40, 10);
  });

  it('clamps unsafe tuning values', () => {
    const next = setTuning({ focusDistance: -4, cardGap: 1, lead: -3 });
    expect(next.focusDistance).toBe(1);
    expect(next.cardGap).toBe(2);
    expect(next.lead).toBe(0);
  });

  it('moves a single knot height without disturbing the others', () => {
    const before = KNOTS.map((knot) => knot.y);
    setKnotY(3, 0.9);
    expect(KNOTS[3].y).toBe(0.9);
    expect(KNOTS[1].y).toBe(before[1]);
    expect(KNOTS[5].y).toBe(before[5]);
  });

  it('ignores invalid knot updates', () => {
    const before = KNOTS[2].y;
    setKnotY(2, Number.NaN);
    setKnotY(99, 1);
    expect(KNOTS[2].y).toBe(before);
  });
});

describe('viewport fit', () => {
  it('keeps the card inside a desktop and a phone frame', () => {
    fit(16 / 9);
    expect(kx).toBeGreaterThan(0);
    expect(kx).toBeLessThanOrEqual(1);

    fit(9 / 19.5);
    expect(kx).toBeGreaterThan(0);
    expect(kx).toBeLessThanOrEqual(1);
  });

  it('falls back to 16:9 for invalid aspect ratios', () => {
    fit(0);
    const fallback = kx;
    fit(Number.NaN);
    expect(kx).toBeCloseTo(fallback, 10);
  });
});
