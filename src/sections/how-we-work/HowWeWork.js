/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * "How we work together" — a pinned depth flight past five white stage cards.
 *
 * The module is intentionally plain JavaScript with one public lifecycle:
 *
 *   const handle = mount(sectionEl)
 *   handle.destroy()
 *
 * `destroy()` is also exported at module scope so an HMR boundary can tear the
 * scene down without knowing the handle. Mounting is idempotent per element.
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FOG_FAR,
  FOG_NEAR,
  FOV,
  FLIGHT_FRACTION,
  FLIGHT_VH,
  HOLD_VH,
  PAPER,
} from './constants';
import {
  CARD_P,
  camZ,
  fit,
  getKnotYs,
  getTuning,
  pathX,
  pathY,
  setKnotY,
  setTuning,
  tubeZ,
} from './path';
import { createCards, loadFonts } from './cards';
import { createHud } from './hud';
import { createPaper } from './paper';
import { createPencil } from './pencil';

gsap.registerPlugin(ScrollTrigger);

const HANDOFF_CLASS = 'hww-handoff';
const STATIC_CLASS = 'hww--static';
const PIN_VH = FLIGHT_VH + HOLD_VH;
const MAX_DPR = 2;

let active = null;

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const phoneViewport = () =>
  window.matchMedia('(max-width: 767px)').matches;

function createFallback(sectionEl) {
  sectionEl.classList.add(STATIC_CLASS);

  return {
    sectionEl,
    destroy() {
      sectionEl.classList.remove(STATIC_CLASS);
    },
  };
}

function createExperience(sectionEl) {
  const host = sectionEl.querySelector('[data-hww-canvas-host]');
  const headerEl = sectionEl.querySelector('[data-hww-header]');
  const hudEl = sectionEl.querySelector('[data-hww-hud]');

  if (!host) return createFallback(sectionEl);

  const canvas = document.createElement('canvas');
  canvas.className = 'hww__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return createFallback(sectionEl);
  }

  host.appendChild(canvas);

  let disposed = false;
  let rafId = 0;
  let lastNow = 0;
  let targetP = 0;
  let currentP = 0;
  let motion = 0;
  let lastFrameMs = 0;
  let viewportHeight = Math.max(1, sectionEl.clientHeight || window.innerHeight);
  let lineScale = 1;
  let trigger = null;
  let pane = null;
  let debugApi = null;
  let resizeQueued = 0;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.autoClear = false;
  renderer.setClearColor(PAPER, 1);
  renderer.info.autoReset = false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAPER, FOG_NEAR, FOG_FAR);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.set(0, 0, camZ(0));

  const initialWidth = Math.max(1, sectionEl.clientWidth || window.innerWidth);
  const initialHeight = Math.max(
    1,
    sectionEl.clientHeight || window.innerHeight,
  );
  fit(initialWidth / initialHeight);

  const cards = createCards(renderer);
  const pencil = createPencil({
    viewportHeightPx: initialHeight,
    phone: phoneViewport(),
    radiusScale: lineScale,
  });
  const paper = createPaper();
  const hud = createHud({ hudEl, headerEl });

  scene.add(cards.group, pencil.group);

  // The incoming "Production, evolved" section rises over the frozen final
  // frame. A negative margin makes it start at the top of the hold window; the
  // process portal boundary is removed so the outgoing canvas is never scaled
  // or dimmed while it is being covered.
  const handoffStage = document.querySelector(
    '[data-portal-stage="capabilities"]',
  );
  if (handoffStage) handoffStage.classList.add(HANDOFF_CLASS);

  // Size the drawing buffer before the first visible frame. ScrollTrigger also
  // calls resize() on refresh, but the initial pass must not wait for it.
  resize();

  function setTargetProgress(progress) {
    const next = clamp01(progress / FLIGHT_FRACTION);
    if (Math.abs(next - targetP) < 1e-6) return;
    targetP = next;
    kick();
  }

  function apply(p) {
    const step = 0.008;
    const dx = pathX(Math.min(1, p + step)) - pathX(Math.max(0, p - step));
    const roll = THREE.MathUtils.clamp(-dx * 0.22, -0.035, 0.035);
    const x = pathX(p);
    const y = pathY(p);

    camera.position.set(x, y, camZ(p));
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(x, y, camZ(p) - 20);

    pencil.update(p);
    hud.update(p);
  }

  function draw(now) {
    const started = performance.now();

    paper.update(now);
    renderer.info.reset();
    renderer.clear(true, true, true);
    paper.render(renderer);
    renderer.clearDepth();
    renderer.render(scene, camera);

    lastFrameMs = performance.now() - started;
  }

  function tick(now) {
    rafId = 0;

    if (disposed || document.hidden) return;

    const dt = Math.min(Math.max((now - lastNow) / 1000, 0.001), 0.05);
    lastNow = now;

    const previous = currentP;
    currentP += (targetP - currentP) * (1 - Math.exp(-10 * dt));
    if (Math.abs(targetP - currentP) < 0.0002) currentP = targetP;

    const speed = Math.abs(currentP - previous) / dt;
    const motionTarget = Math.min(1, speed * 7);
    motion += (motionTarget - motion) * Math.min(1, dt * 14);
    if (currentP === targetP && Math.abs(motion) < 0.002) motion = 0;

    apply(currentP);
    cards.setBreath(motion);
    draw(now);

    if (currentP !== targetP || motion !== 0) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function kick() {
    if (disposed || document.hidden || rafId) return;
    lastNow = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function resize() {
    if (disposed) return;

    const width = Math.max(1, sectionEl.clientWidth || window.innerWidth);
    const height = Math.max(1, sectionEl.clientHeight || window.innerHeight);
    if (width <= 1 || height <= 1) return;

    viewportHeight = height;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    fit(camera.aspect);
    cards.resize();
    pencil.rebuild({
      viewportHeightPx: viewportHeight,
      phone: phoneViewport(),
      radiusScale: lineScale,
    });

    apply(currentP);
    draw(performance.now());
  }

  // One combined resize path: a ResizeObserver catches container changes, and
  // the window listener catches DPR / orientation changes where the CSS size
  // may stay identical.
  const scheduleResize = () => {
    if (resizeQueued) return;
    resizeQueued = requestAnimationFrame(() => {
      resizeQueued = 0;
      resize();
    });
  };

  const resizeObserver = new ResizeObserver(scheduleResize);
  resizeObserver.observe(sectionEl);

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        kick();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    { rootMargin: '160px 0px' },
  );
  intersectionObserver.observe(sectionEl);

  const onVisibility = () => {
    if (!document.hidden) kick();
  };
  document.addEventListener('visibilitychange', onVisibility);

  trigger = ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top top',
    // The wrapper supplies the 550vh scroll distance. Keeping pinSpacing off
    // means later pinned sections (Pricing) measure against a layout that never
    // changes under them.
    end: () => `+=${(sectionEl.offsetHeight * PIN_VH) / 100}`,
    pin: sectionEl,
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      setTargetProgress(self.progress);
    },
    onRefresh: (self) => {
      resize();
      setTargetProgress(self.progress);
    },
  });

  setTargetProgress(trigger.progress);
  apply(currentP);
  draw(performance.now());
  kick();

  loadFonts()
    .then(() => {
      if (disposed) return;
      cards.redraw();
      draw(performance.now());
    })
    .catch(() => undefined);

  function getState() {
    const screen = [];
    const point = new THREE.Vector3();
    cards.cards.forEach((card) => {
      point.copy(card.mesh.position).project(camera);
      screen.push({
        x: (point.x * 0.5 + 0.5),
        y: (-point.y * 0.5 + 0.5),
        depth: point.z,
      });
    });

    return {
      progress: targetP,
      current: currentP,
      cameraZ: camZ(currentP),
      cameraX: pathX(currentP),
      cameraY: pathY(currentP),
      lineZ: tubeZ(currentP),
      cardP: CARD_P.slice(),
      cards: screen,
      activeCard: CARD_P.reduce(
        (nearest, p, index) =>
          Math.abs(p - currentP) < Math.abs(CARD_P[nearest] - currentP)
            ? index
            : nearest,
        0,
      ),
      pinned: Boolean(trigger?.isActive),
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      lastFrameMs,
    };
  }

  function rebuildFromTuning() {
    if (disposed) return;
    fit(camera.aspect);
    cards.layout();
    pencil.rebuild({
      viewportHeightPx: viewportHeight,
      phone: phoneViewport(),
      radiusScale: lineScale,
    });
    hud.update(currentP, true);
    apply(currentP);
    cards.setBreath(0);
    draw(performance.now());
  }

  async function installDebug() {
    if (!import.meta.env.DEV) return;
    if (!new URLSearchParams(window.location.search).has('debug')) return;

    const module = await import('tweakpane');
    if (disposed) return;

    const Pane = module.Pane;
    const tuning = getTuning();
    const settings = {
      focusDistance: tuning.focusDistance,
      cardGap: tuning.cardGap,
      lead: tuning.lead,
      lineScale,
      grain: 0.035,
    };
    const knotSettings = {};
    getKnotYs().forEach((y, index) => {
      knotSettings[`k${index}`] = y;
    });

    const paneInstance = new Pane({ title: 'How we work' });
    pane = paneInstance;

    const pathFolder = paneInstance.addFolder({ title: 'Path' });
    const syncPath = () => {
      setTuning({
        focusDistance: settings.focusDistance,
        cardGap: settings.cardGap,
        lead: settings.lead,
      });
      rebuildFromTuning();
    };

    pathFolder
      .addBinding(settings, 'focusDistance', {
        min: 3,
        max: 12,
        step: 0.1,
        label: 'Focus distance',
      })
      .on('change', syncPath);
    pathFolder
      .addBinding(settings, 'cardGap', {
        min: 3,
        max: 14,
        step: 0.1,
        label: 'Card gap',
      })
      .on('change', syncPath);
    pathFolder
      .addBinding(settings, 'lead', {
        min: 0,
        max: 10,
        step: 0.1,
        label: 'Lead in',
      })
      .on('change', syncPath);

    const knotFolder = paneInstance.addFolder({ title: 'Knot height' });
    getKnotYs().forEach((y, index) => {
      knotFolder
        .addBinding(knotSettings, `k${index}`, {
          min: -1.4,
          max: 1.4,
          step: 0.01,
          label: `Knot ${index}`,
        })
        .on('change', () => {
          setKnotY(index, knotSettings[`k${index}`]);
          rebuildFromTuning();
        });
    });

    const lookFolder = paneInstance.addFolder({ title: 'Look' });
    lookFolder
      .addBinding(settings, 'lineScale', {
        min: 0.2,
        max: 4,
        step: 0.1,
        label: 'Line weight',
      })
      .on('change', () => {
        lineScale = settings.lineScale;
        pencil.rebuild({
          viewportHeightPx: viewportHeight,
          phone: phoneViewport(),
          radiusScale: lineScale,
        });
        draw(performance.now());
      });

    lookFolder
      .addBinding(settings, 'grain', {
        min: 0,
        max: 0.12,
        step: 0.001,
        label: 'Paper grain',
      })
      .on('change', () => {
        paper.setNoise(settings.grain);
        draw(performance.now());
      });

    paneInstance.addButton({ title: 'Reset path' }).on('click', () => {
      setTuning({ focusDistance: 6, cardGap: 7, lead: 4 });
      const next = getTuning();
      settings.focusDistance = next.focusDistance;
      settings.cardGap = next.cardGap;
      settings.lead = next.lead;
      settings.lineScale = 1;
      lineScale = 1;
      const defaults = [0, 0.35, -0.25, 0.3, -0.2, 0.15];
      defaults.forEach((value, index) => {
        setKnotY(index, value);
        knotSettings[`k${index}`] = value;
      });
      rebuildFromTuning();
      paneInstance.refresh();
    });
  }

  if (import.meta.env.DEV) {
    debugApi = {
      getState,
      seek(progress) {
        targetP = clamp01(progress / FLIGHT_FRACTION);
        currentP = targetP;
        motion = 0;
        apply(currentP);
        cards.setBreath(0);
        draw(performance.now());
      },
      rebuild: rebuildFromTuning,
      refresh() {
        ScrollTrigger.refresh();
      },
      get triggers() {
        return ScrollTrigger.getAll().map((item) => ({
          id: item.trigger?.id,
          start: item.start,
          end: item.end,
          isActive: item.isActive,
          pin: item.pin?.id ?? item.pin?.getAttribute?.('data-portal-stage'),
        }));
      },
      get tuning() {
        return getTuning();
      },
    };
    window.__HWW__ = debugApi;
  }

  void installDebug();

  function destroy() {
    if (disposed) return;
    disposed = true;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (resizeQueued) cancelAnimationFrame(resizeQueued);
    resizeQueued = 0;

    document.removeEventListener('visibilitychange', onVisibility);
    intersectionObserver.disconnect();
    resizeObserver.disconnect();

    if (trigger) {
      trigger.kill(true);
      trigger = null;
    }

    if (pane) {
      pane.dispose();
      pane = null;
    }

    if (window.__HWW__ === debugApi) delete window.__HWW__;
    debugApi = null;

    hud.dispose();
    cards.dispose();
    pencil.dispose();
    paper.dispose();
    renderer.dispose();

    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    // A lost context on a canvas that React is about to hand back to StrictMode
    // would break the second mount. Only release it once the element is gone.
    requestAnimationFrame(() => {
      if (!canvas.isConnected) renderer.forceContextLoss();
    });

    sectionEl.classList.remove(STATIC_CLASS);
    if (handoffStage) handoffStage.classList.remove(HANDOFF_CLASS);
  }

  return { sectionEl, destroy, getState };
}

export function mount(sectionEl) {
  if (!sectionEl) return null;

  if (active) {
    if (active.sectionEl === sectionEl) return active;
    active.destroy();
    active = null;
  }

  if (reducedMotion()) {
    active = createFallback(sectionEl);
    return active;
  }

  active = createExperience(sectionEl);
  return active;
}

export function destroy() {
  if (!active) return;
  active.destroy();
  active = null;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    destroy();
  });
}
