/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Five white stage cards drawn into CanvasTextures. The text lives in WebGL so
 * the camera sets the card's apparent size exactly like every other object in
 * the flight. The canvas is intentionally re-drawn on resize (never per frame).
 */

import * as THREE from 'three';
import { stages } from '../../data/stages.js';
import {
  BODY_FONT,
  CARD_TILTS,
  HEADING_FONT,
  MONO_FONT,
} from './constants';
import {
  CARD_P,
  cardH,
  cardW,
  cardZ,
  pathX,
  pathY,
} from './path';

const DESKTOP = {
  width: 1600,
  height: 1000,
  pad: 110,
  indexSize: 40,
  indexSpacing: 7,
  titleSize: 150,
  titleMin: 90,
  bodySize: 44,
  bodyLead: 1.34,
  bodyTop: 0.53,
  tagSize: 34,
  tagSpacing: 2.5,
  kickerSize: 22,
  stroke: 4,
};

const PHONE = {
  width: 1024,
  height: 640,
  pad: 70,
  indexSize: 34,
  indexSpacing: 5,
  titleSize: 118,
  titleMin: 78,
  bodySize: 44,
  bodyLead: 1.36,
  bodyTop: 0.54,
  tagSize: 30,
  tagSpacing: 2,
  kickerSize: 20,
  stroke: 3,
};

const INK = '#1a1a1a';
const WHITE = '#ffffff';

function readStack(variable, fallback) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value || fallback;
}

function isPhoneViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function wobblyRect(ctx, x, y, w, h, seed) {
  const points = [
    [x, y],
    [x + w / 2, y],
    [x + w, y],
    [x + w, y + h / 2],
    [x + w, y + h],
    [x + w / 2, y + h],
    [x, y + h],
    [x, y + h / 2],
  ];

  ctx.beginPath();
  points.forEach(([px, py], index) => {
    const jx = Math.sin((index + 1) * 12.9898 + seed) * 5;
    const jy = Math.sin((index + 1) * 78.233 + seed) * 5;
    if (index === 0) ctx.moveTo(px + jx, py + jy);
    else ctx.lineTo(px + jx, py + jy);
  });
  ctx.closePath();
  ctx.stroke();
}

function drawTracked(ctx, text, x, y, spacing) {
  let cursor = x;
  for (const character of text) {
    ctx.fillText(character, cursor, y);
    cursor += ctx.measureText(character).width + spacing;
  }
  return cursor - spacing;
}

function measureTracked(ctx, text, spacing) {
  let width = 0;
  for (const character of text) {
    width += ctx.measureText(character).width + spacing;
  }
  return Math.max(0, width - spacing);
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else if (line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = word;
    }
  }

  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === 0) return [''];

  // If anything is left over, end the last visible line with an ellipsis so the
  // copy never overflows the card.
  const consumed = lines.join(' ');
  if (consumed.length < text.trim().length && lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (last.length > 1) {
      const candidate = `${last.replace(/[\s.,;:!?-]+$/, '')}...`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        lines[maxLines - 1] = candidate;
        break;
      }
      last = last.slice(0, -1);
    }
  }

  return lines;
}

function drawCard(canvas, stage, index) {
  const mobile = isPhoneViewport();
  const layout = mobile ? PHONE : DESKTOP;

  if (canvas.width !== layout.width || canvas.height !== layout.height) {
    canvas.width = layout.width;
    canvas.height = layout.height;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height, pad } = layout;
  const heading = readStack('--font-heading', HEADING_FONT);
  const body = readStack('--font-body', BODY_FONT);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, width, height);

  // Hand-drawn ink border. The jitter is deterministic per card.
  ctx.strokeStyle = INK;
  ctx.lineWidth = layout.stroke;
  ctx.lineJoin = 'round';
  wobblyRect(ctx, pad, pad, width - pad * 2, height - pad * 2, index * 17 + 3);

  // Index, top left.
  ctx.fillStyle = INK;
  ctx.font = `500 ${layout.indexSize}px ${MONO_FONT}`;
  drawTracked(
    ctx,
    String(index + 1).padStart(2, '0'),
    pad + 8,
    pad + layout.indexSize + 10,
    layout.indexSpacing
  );

  ctx.fillStyle = 'rgba(26, 26, 26, 0.4)';
  ctx.fillRect(
    pad + 8,
    pad + layout.indexSize + 28,
    mobile ? 44 : 62,
    2
  );

  // Small kicker, top right.
  ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
  ctx.font = `500 ${layout.kickerSize}px ${MONO_FONT}`;
  const kicker = 'STAGE';
  const kickerWidth = measureTracked(ctx, kicker, 4);
  drawTracked(
    ctx,
    kicker,
    width - pad - 8 - kickerWidth,
    pad + layout.kickerSize + 12,
    4
  );

  // Title. Step the size down until the longest title fits.
  const maxTitleWidth = width - pad * 2 - 20;
  let titleSize = layout.titleSize;
  ctx.font = `italic ${titleSize}px ${heading}`;
  while (
    titleSize > layout.titleMin &&
    ctx.measureText(stage.title).width > maxTitleWidth
  ) {
    titleSize -= 4;
    ctx.font = `italic ${titleSize}px ${heading}`;
  }

  ctx.fillStyle = INK;
  ctx.fillText(stage.title, pad + 8, height * 0.38);

  // Body, at most two lines.
  ctx.font = `400 ${layout.bodySize}px ${body}`;
  const lines = wrapLines(
    ctx,
    stage.text,
    width - pad * 2 - 20,
    2
  );
  ctx.fillStyle = 'rgba(26, 26, 26, 0.72)';
  const lineHeight = layout.bodySize * layout.bodyLead;
  lines.forEach((lineText, lineIndex) => {
    ctx.fillText(lineText, pad + 8, height * layout.bodyTop + lineIndex * lineHeight);
  });

  // Tags, separated by 3px rules.
  const tagY = height * 0.815;
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.24)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad + 8, tagY - (mobile ? 46 : 62));
  ctx.lineTo(width - pad - 8, tagY - (mobile ? 46 : 62));
  ctx.stroke();

  ctx.font = `500 ${layout.tagSize}px ${MONO_FONT}`;
  let cursor = pad + 8;
  const tags = Array.isArray(stage.tags) ? stage.tags.slice(0, 3) : [];

  tags.forEach((tag, tagIndex) => {
    const label = String(tag).toUpperCase();
    ctx.fillStyle = 'rgba(26, 26, 26, 0.66)';
    const end = drawTracked(ctx, label, cursor, tagY, layout.tagSpacing);

    if (tagIndex < tags.length - 1) {
      cursor = end + (mobile ? 22 : 30);
      ctx.fillStyle = 'rgba(26, 26, 26, 0.3)';
      ctx.fillRect(cursor, tagY - layout.tagSize + 4, 3, layout.tagSize + 2);
      cursor += 3 + (mobile ? 22 : 30);
    }
  });
}

function loadFonts() {
  if (!document.fonts?.load) return Promise.resolve();

  const loads = [
    document.fonts.load('italic 150px "Instrument Serif"'),
    document.fonts.load('400 44px "Barlow"'),
    document.fonts.load('500 34px "Space Grotesk"'),
  ];

  return Promise.allSettled(loads)
    .then(() => document.fonts.ready)
    .catch(() => undefined);
}

export function createCards(renderer) {
  const group = new THREE.Group();
  group.name = 'hww-cards';

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const mobile = isPhoneViewport();
  const layout = mobile ? PHONE : DESKTOP;

  const cards = stages.slice(0, 5).map((stage, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = layout.width;
    canvas.height = layout.height;
    drawCard(canvas, stage, index);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      fog: true,
      transparent: false,
      toneMapped: false,
    });

    const geometry = new THREE.PlaneGeometry(cardW, cardH);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `hww-card-${index + 1}`;
    mesh.rotation.z = CARD_TILTS[index];
    mesh.position.set(pathX(CARD_P[index]), pathY(CARD_P[index]), cardZ(index));
    group.add(mesh);

    return {
      stage,
      index,
      canvas,
      texture,
      material,
      mesh,
      geometry,
    };
  });

  function layoutCards() {
    cards.forEach((card, index) => {
      const nextGeometry = new THREE.PlaneGeometry(cardW, cardH);
      card.mesh.geometry.dispose();
      card.mesh.geometry = nextGeometry;
      card.geometry = nextGeometry;
      card.mesh.position.set(
        pathX(CARD_P[index]),
        pathY(CARD_P[index]),
        cardZ(index)
      );
    });
  }

  function redraw() {
    cards.forEach((card, index) => {
      drawCard(card.canvas, card.stage, index);
      card.texture.needsUpdate = true;
    });
  }

  function resize() {
    layoutCards();
    redraw();
  }

  function setBreath(amount) {
    const scale = 1 + 0.02 * Math.abs(amount);
    cards.forEach((card) => card.mesh.scale.setScalar(scale));
  }

  function dispose() {
    cards.forEach((card) => {
      group.remove(card.mesh);
      card.geometry.dispose();
      card.material.dispose();
      card.texture.dispose();
    });
  }

  return {
    group,
    cards,
    layout: layoutCards,
    resize,
    redraw,
    setBreath,
    dispose,
  };
}

export { loadFonts, drawCard, wobblyRect };
