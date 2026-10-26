/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Every tunable for the "How we work together" depth flight lives here.
 */

import * as THREE from 'three';

export const CARD_COUNT = 5;
export const FOV = 40; // vertical field of view, degrees
export const FOCUS_DISTANCE = 6; // camera to card centre when that card is focused
export const CARD_GAP = 7; // z distance between neighbouring cards
export const LEAD = 4; // camera starts 4 units before card 01's focus point
export const TRAVEL = (CARD_COUNT - 1) * CARD_GAP + LEAD; // 32
export const CAM_Z_START = FOCUS_DISTANCE + LEAD; // 10
export const TIP_LEAD = FOCUS_DISTANCE; // pencil tip sits this far in front of camera
export const CARD_ASPECT = 1.6;
export const CARD_W_MAX = 3.2;
export const FLIGHT_VH = 450;
export const HOLD_VH = 100;
export const FLIGHT_FRACTION = FLIGHT_VH / (FLIGHT_VH + HOLD_VH); // 0.818
export const FOG_NEAR = 8;
export const FOG_FAR = 44;
export const PAPER = '#fbfaf6';
export const GRAPHITE = '#2a2a2a';
export const SAMPLES = 600;
export const RADIAL = 8;
export const FOV_RAD = THREE.MathUtils.degToRad(FOV);

// Fixed, authored tilts. Never random: a random tilt makes a card look
// different after every remount or HMR pass.
export const CARD_TILTS = [-0.014, 0.011, -0.007, 0.016, -0.01];

export const HEADING_FONT = '"Instrument Serif", Georgia, serif';
export const BODY_FONT = '"Barlow", Arial, sans-serif';
export const MONO_FONT = '"Space Grotesk", "SFMono-Regular", Consolas, monospace';
