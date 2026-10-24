/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * "How we work together" — a pinned, scroll-driven flight through a hand-drawn
 * graphite line. The camera travels into -Z along an OPEN Catmull-Rom curve and
 * stops with the fifth stage card centred. Nothing wraps, repeats or loops.
 *
 * The pencil line is WebGL (two thin, wobbling tube strands). The five cards
 * are real DOM, projected by CSS3DRenderer so the copy stays crisp. Three.js is
 * loaded only shortly before the section arrives and everything — renderers,
 * geometries, materials, observers and the ScrollTrigger — is disposed on
 * unmount.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollFilterHeading } from "./ScrollFilterHeading";
import "./process.css";

gsap.registerPlugin(ScrollTrigger);

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const STEPS: ProcessStep[] = [
  {
    id: "brief",
    title: "Brief",
    description:
      "We discuss your business goals, audience, and what success looks like.",
    tags: ["Goals", "Audience", "Scope"],
  },
  {
    id: "design",
    title: "Design mockup",
    description:
      "I share a visual direction before writing a single line of code.",
    tags: ["Direction", "Layout", "Review"],
  },
  {
    id: "build",
    title: "Build",
    description:
      "Fast, responsive development with clean, maintainable code.",
    tags: ["Responsive", "Performance", "Clean code"],
  },
  {
    id: "launch",
    title: "Launch and support",
    description:
      "Go live, then I help you keep the site updated and performing.",
    tags: ["Go live", "Handover", "Support"],
  },
  {
    id: "grow",
    title: "Grow",
    description:
      "We improve what the data shows: search, ads, content, and the next round of pages.",
    tags: ["SEO", "Content", "Next round"],
  },
];

const STAGES = STEPS.length;
const T_START = 0.1;
const T_END = 0.9;
const FOCUS_DIST = 10;
const FOV = 50;

/**
 * The camera sits a short distance behind the curve point it is following.
 * Keep this below the cards' Z-spacing (roughly 4.8 units here) so the card
 * the camera just left is already behind it. A bigger offset would leave the
 * previous card in front of the active one, which is what made the reference
 * build feel wrong.
 */
const CAM_OFFSET_DESKTOP = 3.2;
const CAM_OFFSET_MOBILE = 2.4;
const PARALLAX_DESKTOP = 0.12;

/** Positions of the five stage cards. Never at t = 0 or t = 1. */
const STAGE_T = STEPS.map(
  (_, index) => T_START + (index / (STAGES - 1)) * (T_END - T_START),
);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isLowEndDevice() {
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return cores < 4 || (typeof memory === "number" && memory < 4);
}

function StaticProcessSection() {
  const artRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;

    const draw = () => art.classList.add("is-drawn");

    if (!("IntersectionObserver" in window)) {
      draw();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        draw();
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(art);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="process-section process-static"
    >
      <div className="process-static__inner">
        <header className="process-static__header">
          <span className="process-eyebrow">My process</span>
          <ScrollFilterHeading
            as="h2"
            id="process-heading"
            className="process-title"
          >
            How we work together
          </ScrollFilterHeading>
          <p className="process-intro">
            A clear path from the first conversation to what happens after
            launch. Five stages, one person accountable for the whole build.
          </p>
        </header>

        <div ref={artRef} className="process-static__art" aria-hidden="true">
          <svg viewBox="0 0 1200 220" preserveAspectRatio="none">
            <path
              className="process-static__art-ghost"
              pathLength={1}
              d="M-20 177C132 66 268 33 392 90c113 52 184 108 300 80 144-35 212-111 334-94 94 14 148 47 194 69"
            />
            <path
              pathLength={1}
              d="M-20 177C132 66 268 33 392 90c113 52 184 108 300 80 144-35 212-111 334-94 94 14 148 47 194 69"
            />
          </svg>
        </div>

        <div className="process-static__grid">
          {STEPS.map((step, index) => (
            <article key={step.id} className="process-static__card">
              <span className="process-static__card-index">
                STEP {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="process-static__card-title">{step.title}</h3>
              <p className="process-static__card-body">{step.description}</p>
              <ul className="process-static__card-tags" aria-label="Focus">
                {step.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TimelineAnimation({ className = "" }: { className?: string }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardLayerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const tiltsRef = useRef<number[]>([]);
  if (tiltsRef.current.length !== STEPS.length) {
    tiltsRef.current = STEPS.map(() => Math.random() * 2 - 1);
  }

  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const isStatic = reducedMotion || fallback;

  useEffect(() => {
    if (isStatic) return;

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const cardLayer = cardLayerRef.current;
    if (!section || !canvas || !cardLayer) return;

    const cardElements = cardRefs.current.filter(
      (element): element is HTMLElement => element !== null,
    );
    if (cardElements.length !== STAGES) return;

    // Hide the cards until CSS3DRenderer has placed them, otherwise they all
    // stack in the top-left corner while the Three.js chunk is still loading.
    cardLayer.style.visibility = "hidden";
    cardElements.forEach((element) => {
      element.style.opacity = "0";
      element.style.pointerEvents = "none";
    });

    const activeIndexRef = { current: -1 };
    const setActiveStep = (index: number) => {
      if (index === activeIndexRef.current) return;
      activeIndexRef.current = index;

      if (counterRef.current) {
        counterRef.current.textContent = String(index + 1).padStart(2, "0");
      }

      progressRefs.current.forEach((step, stepIndex) => {
        if (!step) return;
        step.dataset.passed = stepIndex <= index ? "true" : "false";
        step.dataset.active = stepIndex === index ? "true" : "false";
      });

      cardElements.forEach((element, cardIndex) => {
        element.setAttribute(
          "aria-hidden",
          cardIndex === index ? "false" : "true",
        );
      });
    };

    setActiveStep(0);

    const smooth = { p: 0 };
    const toProgress = gsap.quickTo(smooth, "p", {
      duration: 0.9,
      ease: "power3.out",
    });

    let cancelled = false;
    let started = false;
    let disposeScene: (() => void) | null = null;
    let trigger: ScrollTrigger | null = null;
    let lazyObserver: IntersectionObserver | null = null;

    /**
     * Scroll drives the flight. The section is held in place by CSS sticky;
     * ScrollTrigger only reports progress. quickTo does the flight smoothing,
     * and its target is always clamped so progress can never wrap.
     */
    trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => toProgress(clamp01(self.progress)),
      onRefresh: (self) => {
        const progress = clamp01(self.progress);
        smooth.p = progress;
        toProgress(progress);
      },
    });

    // A restored scroll position (refresh, deep link, back/forward) should
    // start at the right card rather than animating from the top.
    smooth.p = clamp01(trigger.progress);
    toProgress(smooth.p);

    const start = async () => {
      if (cancelled || started) return;
      started = true;
      lazyObserver?.disconnect();
      lazyObserver = null;

      let THREE: typeof import("three");
      let CSS3DRenderer: typeof import("three/examples/jsm/renderers/CSS3DRenderer.js").CSS3DRenderer;
      let CSS3DObject: typeof import("three/examples/jsm/renderers/CSS3DRenderer.js").CSS3DObject;

      try {
        const [threeModule, cssModule] = await Promise.all([
          import("three"),
          import("three/examples/jsm/renderers/CSS3DRenderer.js"),
        ]);
        THREE = threeModule;
        CSS3DRenderer = cssModule.CSS3DRenderer;
        CSS3DObject = cssModule.CSS3DObject;
      } catch {
        if (!cancelled) setFallback(true);
        return;
      }
      if (cancelled) return;

      let renderer: import("three").WebGLRenderer | null = null;
      let cssRenderer: InstanceType<typeof CSS3DRenderer> | null = null;

      try {
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;
        const camOffset = isDesktop ? CAM_OFFSET_DESKTOP : CAM_OFFSET_MOBILE;
        const lowEnd = isLowEndDevice();
        const tubularSegments = lowEnd ? 300 : 800;

        // ---------------------------------------------------------------
        // 1. An OPEN, hand-placed curve. closed = false, no wrap anywhere.
        // ---------------------------------------------------------------
        const curve = new THREE.CatmullRomCurve3(
          [
            new THREE.Vector3(-6, -1, 2),
            new THREE.Vector3(-2, 2, -3),
            new THREE.Vector3(2, -2, -7),
            new THREE.Vector3(6, 1, -11),
            new THREE.Vector3(2, 3, -15),
            new THREE.Vector3(-3, -1, -19),
            new THREE.Vector3(-1, 0, -22),
          ],
          false,
          "catmullrom",
          0.5,
        );

        const scene = new THREE.Scene();
        scene.background = null;

        // ---------------------------------------------------------------
        // 2. Pencil line: two thin strands of the same curve.
        // ---------------------------------------------------------------
        const strandOpacity = isDesktop ? [0.9, 0.5] : [0.9];
        const strands = strandOpacity.map((opacity, strandIndex) => {
          const lateral = strandIndex === 0 ? -0.006 : 0.006;
          const points = Array.from({ length: 400 }, (_, pointIndex) => {
            const p = curve.getPointAt(pointIndex / 399);
            // Jitter is generated once, so the graphite wobble stays fixed
            // while the camera moves. It must never be re-randomised per frame.
            const wobble = (Math.random() - 0.5) * 0.004;
            return new THREE.Vector3(
              p.x + wobble,
              p.y + wobble * 0.6 + lateral,
              p.z,
            );
          });

          const strandCurve = new THREE.CatmullRomCurve3(
            points,
            false,
            "catmullrom",
            0.5,
          );
          const geometry = new THREE.TubeGeometry(
            strandCurve,
            tubularSegments,
            0.01,
            6,
            false,
          );
          const material = new THREE.MeshBasicMaterial({
            color: 0x2a2a2a,
            transparent: true,
            opacity,
            depthWrite: false,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.frustumCulled = false;
          mesh.renderOrder = 2;
          scene.add(mesh);
          return mesh;
        });

        // Pencil tip at the front of the drawn line.
        const tipGeometry = new THREE.SphereGeometry(0.055, 10, 10);
        const tipMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.frustumCulled = false;
        tip.renderOrder = 3;
        scene.add(tip);

        // A tiny cap rounds the very start of the line, so the open end of the
        // tube never reads as a cut seam when the first frames are on screen.
        const startCap = new THREE.Mesh(tipGeometry, tipMaterial);
        startCap.position.copy(curve.getPointAt(0));
        startCap.scale.setScalar(0.22);
        startCap.frustumCulled = false;
        startCap.renderOrder = 2;
        scene.add(startCap);

        // ---------------------------------------------------------------
        // 3. Camera and renderers. Flat basic materials only: no lights, no
        //    shadow maps, no textures.
        // ---------------------------------------------------------------
        const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        cssRenderer = new CSS3DRenderer({ element: cardLayer });

        // ---------------------------------------------------------------
        // 4. Stage cards, anchored along the same curve.
        // ---------------------------------------------------------------
        const cssScene = new THREE.Scene();
        const cards = cardElements.map((element, index) => {
          const obj = new CSS3DObject(element);
          obj.position.copy(curve.getPointAt(STAGE_T[index]));
          obj.rotation.z = 0;
          element.style.pointerEvents = "none";
          cssScene.add(obj);
          return { element, obj };
        });

        let viewportWidth = 1;
        let viewportHeight = 1;
        let baseCardScale = 0.01;

        const measure = () => {
          viewportWidth = Math.max(1, section.clientWidth);
          viewportHeight = Math.max(1, section.clientHeight);
          const focal =
            viewportHeight / (2 * Math.tan(((FOV * Math.PI) / 180) / 2));
          const activeFocus = Math.max(
            0,
            1 - camOffset / FOCUS_DIST,
          );
          const activeScale = 0.7 + activeFocus ** 3 * 0.4;
          // Normalise CSS3DObject scale so the focused card is exactly its CSS
          // size on screen at any viewport height.
          baseCardScale = camOffset / (focal * activeScale);
        };

        const resize = () => {
          measure();
          renderer?.setSize(viewportWidth, viewportHeight, false);
          cssRenderer?.setSize(viewportWidth, viewportHeight);
          camera.aspect = viewportWidth / viewportHeight;
          camera.updateProjectionMatrix();
          updateScene(smooth.p);
        };

        const updateCards = (progress: number) => {
          for (const { element, obj } of cards) {
            const distance = camera.position.distanceTo(obj.position);
            const inFront = obj.position.z - camera.position.z < -0.15;
            const f = Math.max(0, 1 - distance / FOCUS_DIST);
            const scale = 0.7 + f ** 3 * 0.4;

            obj.scale.setScalar(baseCardScale * scale);
            obj.visible = inFront && distance < 28;
            // The reference formula, applied literally.
            element.style.opacity = String(0.35 + f * 0.65);
          }

          const nextIndex = Math.round(clamp01(progress) * (STAGES - 1));
          setActiveStep(Math.max(0, Math.min(STAGES - 1, nextIndex)));
        };

        const minusZ = new THREE.Vector3();
        const parallax = { x: 0, y: 0 };
        let toParallaxX: ((value: number) => void) | null = null;
        let toParallaxY: ((value: number) => void) | null = null;
        let onPointerMove: ((event: PointerEvent) => void) | null = null;

        if (isDesktop) {
          toParallaxX = gsap.quickTo(parallax, "x", {
            duration: 1,
            ease: "power2.out",
          });
          toParallaxY = gsap.quickTo(parallax, "y", {
            duration: 1,
            ease: "power2.out",
          });

          onPointerMove = (event) => {
            const nx = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
            const ny = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
            toParallaxX?.(nx * PARALLAX_DESKTOP);
            toParallaxY?.(ny * PARALLAX_DESKTOP);
          };
          window.addEventListener("pointermove", onPointerMove, {
            passive: true,
          });
        }

        const updateScene = (progress: number) => {
          // The camera never wraps: t is always between T_START and T_END.
          const t = T_START + clamp01(progress) * (T_END - T_START);
          const point = curve.getPointAt(t);
          const ahead = curve.getPointAt(Math.min(t + 0.012, 1));

          camera.position.set(
            point.x + parallax.x,
            point.y + parallax.y,
            point.z + camOffset,
          );
          camera.lookAt(
            ahead.x + parallax.x,
            ahead.y + parallax.y,
            ahead.z + camOffset,
          );

          // Give the view a very small roll so turns feel like banking without
          // making the card copy hard to read.
          minusZ.copy(point).sub(ahead);
          camera.rotateZ(
            Math.max(-0.035, Math.min(0.035, minusZ.x * 0.012)),
          );

          // Draw the line exactly up to the camera's current point.
          const drawT = clamp01(t);
          for (const mesh of strands) {
            const indexCount = mesh.geometry.index?.count ?? 0;
            mesh.geometry.setDrawRange(
              0,
              Math.max(0, Math.floor(indexCount * drawT)),
            );
          }

          tip.position.copy(point);

          updateCards(progress);

          renderer?.render(scene, camera);
          cssRenderer?.render(cssScene, camera);
        };

        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(section);

        updateScene(smooth.p);
        cardLayer.style.visibility = "visible";

        let running = false;
        let visible = true;

        const tick = () => {
          updateScene(smooth.p);
        };

        const startLoop = () => {
          if (running || cancelled) return;
          running = true;
          gsap.ticker.add(tick);
        };

        const stopLoop = () => {
          if (!running) return;
          running = false;
          gsap.ticker.remove(tick);
        };

        let visibilityObserver: IntersectionObserver | null = null;
        if ("IntersectionObserver" in window) {
          visibilityObserver = new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
              if (visible) startLoop();
              else stopLoop();
            },
            { rootMargin: "25% 0px 25% 0px" },
          );
          visibilityObserver.observe(section);
        } else {
          visible = true;
        }

        if (visible) startLoop();

        const scheduleRefresh = () => {
          if (!cancelled) ScrollTrigger.refresh();
        };
        const refreshTimer = window.setTimeout(scheduleRefresh, 60);
        void document.fonts?.ready.then(scheduleRefresh).catch(() => undefined);

        disposeScene = () => {
          window.clearTimeout(refreshTimer);
          stopLoop();
          visibilityObserver?.disconnect();
          resizeObserver.disconnect();
          if (onPointerMove) {
            window.removeEventListener("pointermove", onPointerMove);
          }
          gsap.killTweensOf(parallax);
          gsap.killTweensOf(smooth);

          // Put the React-owned cards back where React expects them before the
          // renderer's internal DOM is removed.
          cssScene.clear();
          for (const element of cardElements) {
            cardLayer.appendChild(element);
            element.style.opacity = "";
            element.style.pointerEvents = "";
            element.style.display = "";
          }
          Array.from(cardLayer.children).forEach((child) => {
            if (!cardElements.includes(child as HTMLElement)) child.remove();
          });

          for (const mesh of strands) {
            mesh.geometry.dispose();
            (mesh.material as import("three").Material).dispose();
          }
          tipGeometry.dispose();
          tipMaterial.dispose();

          cssRenderer = null;
          renderer?.dispose();
          renderer?.forceContextLoss();
          renderer = null;

          cardLayer.style.visibility = "";
        };
      } catch {
        if (cssRenderer) {
          for (const element of cardElements) {
            cardLayer.appendChild(element);
          }
          Array.from(cardLayer.children).forEach((child) => {
            if (!cardElements.includes(child as HTMLElement)) child.remove();
          });
        }
        renderer?.dispose();
        renderer?.forceContextLoss();
        renderer = null;
        if (!cancelled) setFallback(true);
      }
    };

    if ("IntersectionObserver" in window) {
      lazyObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          void start();
        },
        { rootMargin: "90% 0px 90% 0px" },
      );
      lazyObserver.observe(section);
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      lazyObserver?.disconnect();
      lazyObserver = null;
      disposeScene?.();
      disposeScene = null;
      trigger?.kill();
      trigger = null;
      gsap.killTweensOf(smooth);
      cardLayer.style.visibility = "";
    };
  }, [isStatic]);

  if (isStatic) {
    return <StaticProcessSection />;
  }

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-heading"
      className={`process-section process3d-section ${className}`.trim()}
    >
      <div className="process3d-pin">
        <div className="process3d-canvas" aria-hidden="true">
          <canvas ref={canvasRef} className="process3d-canvas__surface" />
        </div>

        <div ref={cardLayerRef} className="process3d-cards">
          {STEPS.map((step, index) => (
            <article
              key={step.id}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className="stage-card"
              data-stage={index + 1}
              aria-hidden={index === 0 ? "false" : "true"}
            >
              <div
                className="stage-card__inner"
                style={{
                  transform: `rotate(${tiltsRef.current[index].toFixed(2)}deg)`,
                }}
              >
                <div className="stage-card__topline">
                  <span className="stage-card__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="stage-card__kicker">Stage</span>
                </div>
                <h3 className="stage-card__title">{step.title}</h3>
                <p className="stage-card__body">{step.description}</p>
                <ul className="stage-card__tags" aria-label="Focus">
                  {step.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <header className="process3d-header">
          <div className="process-header__lockup">
            <span className="process-eyebrow">My process</span>
            <ScrollFilterHeading
              as="h2"
              id="process-heading"
              className="process-title"
            >
              How we work together
            </ScrollFilterHeading>
            <p className="process-intro">
              A clear path from the first conversation to what happens after
              launch. Five stages, one person accountable for the whole build.
            </p>
          </div>
          <div className="process-counter" aria-live="polite" aria-atomic="true">
            <span ref={counterRef} className="process-counter__current">
              01
            </span>
            <span className="process-counter__total">/ 05</span>
          </div>
        </header>

        <div className="process3d-progress" aria-hidden="true">
          {STEPS.map((step, index) => (
            <span
              key={step.id}
              ref={(element) => {
                progressRefs.current[index] = element;
              }}
              className="process-progress-step"
              data-passed={index === 0 ? "true" : "false"}
              data-active={index === 0 ? "true" : "false"}
            >
              <span className="process-progress-step__num">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="process-progress-step__label">{step.title}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
