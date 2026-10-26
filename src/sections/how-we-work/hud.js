/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Small DOM overlay: stage counter, five-segment progress meter, and the intro
 * fade. All work happens outside the React render cycle.
 */

import * as THREE from 'three';
import { CARD_P } from './path';

export function createHud({ hudEl, headerEl }) {
  if (!hudEl) {
    return { update() {}, dispose() {} };
  }

  const countEl = hudEl.querySelector('[data-hud-count]');
  const fills = Array.from(hudEl.querySelectorAll('[data-hud-fill]'));
  let lastIndex = -1;
  let lastP = -1;

  function update(p, force = false) {
    if (!force && Math.abs(p - lastP) < 1e-5) return;
    lastP = p;

    let nearest = 0;
    let smallest = Infinity;
    for (let i = 0; i < CARD_P.length; i += 1) {
      const distance = Math.abs(CARD_P[i] - p);
      if (distance < smallest) {
        smallest = distance;
        nearest = i;
      }
    }

    if (nearest !== lastIndex) {
      lastIndex = nearest;
      if (countEl) countEl.textContent = String(nearest + 1).padStart(2, '0');
    }

    fills.forEach((fill, index) => {
      const start = index === 0 ? 0 : CARD_P[index - 1];
      const end = CARD_P[index];
      const amount = THREE.MathUtils.clamp(
        (p - start) / Math.max(end - start, 1e-6),
        0,
        1
      );
      fill.style.transform = `scaleX(${amount.toFixed(4)})`;
    });

    if (headerEl) {
      const fade = 1 - THREE.MathUtils.clamp(p / 0.1, 0, 1);
      headerEl.style.opacity = fade.toFixed(3);
    }
  }

  return {
    update,
    dispose() {
      if (headerEl) headerEl.style.removeProperty('opacity');
      fills.forEach((fill) => fill.style.removeProperty('transform'));
    },
  };
}
