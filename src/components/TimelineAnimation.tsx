/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * "How we work together" — a pinned white section with a Three.js camera ride
 * along a Catmull-Rom path. The same path is drawn as a tube that grows with
 * scroll, four spheres mark the stages, and DOM panels are projected to the
 * spheres so the copy stays crisp and selectable.
 *
 * Three.js is loaded lazily once the section approaches the viewport. The
 * render loop pauses off-screen and everything is disposed on unmount.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ScrollFilterHeading } from "./ScrollFilterHeading";

interface ProcessStep {
  id: string;
  title: string;
  description: string;
}

const STEPS: ProcessStep[] = [
  {
    id: "brief",
    title: "Brief",
    description: "We discuss your business goals, audience, and what success looks like.",
  },
  {
    id: "design",
    title: "Design mockup",
    description: "I share a visual direction before writing a single line of code.",
  },
  {
    id: "build",
    title: "Build",
    description: "Fast, responsive development with clean, maintainable code.",
  },
  {
    id: "launch",
    title: "Launch and support",
    description: "Go live, then I help you keep the site updated and performing.",
  },
];

/** Arc-length positions of the four stage markers on the curve. */
const STAGE_T = [0.09, 0.36, 0.63, 0.9] as const;

/**
 * The camera path, authored in code as a shallow S that recedes through space.
 * The camera rides slightly in front of it (positive Z offset) so the drawn
 * line and the upcoming stage markers stay visible ahead of the lens.
 */
const PATH_POINTS = [
  [-5.2, 0.3, 2.4],
  [-4.1, -0.55, 0.6],
  [-2.5, 0.7, -1.6],
  [-0.6, -0.65, -3.8],
  [1.2, 0.65, -6.1],
  [3.0, -0.4, -8.4],
  [4.6, 0.55, -10.8],
  [3.6, 0.2, -13.2],
] as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function TimelineAnimation({ className = "" }: { className?: string }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);

  const [staticMode, setStaticMode] = useState(prefersReducedMotion);
  const [fallback, setFallback] = useState(false);
  const [reached, setReached] = useState(() =>
    prefersReducedMotion() ? STEPS.length : 0,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setStaticMode(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (staticMode) setReached(STEPS.length);
  }, [staticMode]);

  const isStatic = staticMode || fallback;

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!section || !canvas || !wrap) return;

    let cancelled = false;
    let started = false;
    let disposeScene: (() => void) | null = null;
    let lazyObserver: IntersectionObserver | null = null;

    const start = async () => {
      if (cancelled || started) return;
      started = true;
      lazyObserver?.disconnect();
      lazyObserver = null;

      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        if (!cancelled) setFallback(true);
        return;
      }
      if (cancelled) return;

      try {
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0xffffff, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 200);

        const points = PATH_POINTS.map(
          ([x, y, z]) => new THREE.Vector3(x, y, z),
        );
        const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);

        // A lighter tube on phones keeps the segment count (and the frame cost)
        // down without changing the shape of the path.
        const startsDesktop = window.matchMedia("(min-width: 768px)").matches;
        const tubeSegments = startsDesktop ? 300 : 150;
        const radialSegments = startsDesktop ? 8 : 5;
        const tubeGeometry = new THREE.TubeGeometry(
          curve,
          tubeSegments,
          0.024,
          radialSegments,
          false,
        );
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        scene.add(tube);

        const totalIndexCount = tubeGeometry.index?.count ?? 0;
        const indicesPerSegment = radialSegments * 6;

        const spheres = STAGE_T.map((stage) => {
          const geometry = new THREE.SphereGeometry(0.085, 18, 18);
          const material = new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.18,
            depthWrite: false,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(curve.getPointAt(stage));
          scene.add(mesh);
          return mesh;
        });

        let desktop = startsDesktop;
        let progressTarget = 0;
        let progressSmoothed = 0;
        let reachedCount = 0;
        let panelWidths: number[] = [];

        const clearPanelStyles = () => {
          panelRefs.current.forEach((panel) => {
            if (!panel) return;
            panel.style.opacity = "";
            panel.style.transform = "";
            panel.style.visibility = "";
          });
        };

        const renderStaticScene = () => {
          const box = new THREE.Box3().setFromPoints(points);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          camera.position.set(
            center.x,
            center.y + Math.max(2.6, size.y * 0.9),
            center.z + Math.max(15, size.z * 1.15),
          );
          camera.lookAt(center);

          tubeGeometry.setDrawRange(0, totalIndexCount);
          spheres.forEach((sphere) => {
            sphere.material.opacity = 1;
            sphere.scale.setScalar(1);
          });

          renderer.render(scene, camera);
        };

        const placePanels = (progress: number) => {
          const width = wrap.clientWidth;
          const height = wrap.clientHeight;
          const vector = new THREE.Vector3();

          spheres.forEach((sphere, index) => {
            const panel = panelRefs.current[index];
            if (!panel) return;

            const stage = STAGE_T[index];
            // The first panel is already on screen when the section pins.
            const fadeIn =
              index === 0
                ? 1
                : smoothstep(stage - 0.13, stage - 0.05, progress);
            const fadeOut = 1 - smoothstep(stage + 0.06, stage + 0.15, progress);
            const opacity = fadeIn * fadeOut;

            // Phones keep the panels in a fixed stack under the canvas: only
            // opacity and a short vertical slide are written per frame.
            if (!desktop) {
              panel.style.opacity = opacity.toFixed(3);
              panel.style.visibility = opacity > 0.005 ? "visible" : "hidden";
              panel.style.transform = `translate3d(0, ${((1 - fadeIn) * 14).toFixed(1)}px, 0)`;
              return;
            }

            vector.copy(sphere.position).project(camera);
            const inFront = vector.z < 1;
            const screenX = (vector.x * 0.5 + 0.5) * width;
            const screenY = (-vector.y * 0.5 + 0.5) * height;

            const panelWidth = panelWidths[index] || 300;
            const offset = 92;
            let x = screenX + offset;
            if (x + panelWidth > width - 24) {
              x = screenX - panelWidth - offset;
            }
            x = Math.max(24, Math.min(x, width - panelWidth - 24));
            const y = Math.max(120, Math.min(screenY, height - 120));

            const visibleOpacity = inFront ? opacity : 0;
            panel.style.opacity = visibleOpacity.toFixed(3);
            panel.style.visibility =
              visibleOpacity > 0.005 ? "visible" : "hidden";
            panel.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%)`;
          });
        };

        const updateScene = (progress: number) => {
          const t = clamp01(progress);
          const position = curve.getPointAt(t);
          camera.position.set(
            position.x + 0.8,
            position.y + 1.45,
            position.z + 6.4,
          );
          const ahead = curve.getPointAt(Math.min(1, t + 0.055));
          camera.lookAt(ahead.x, ahead.y + 0.1, ahead.z);

          const drawnSegments = Math.max(
            0,
            Math.min(tubeSegments, Math.floor(tubeSegments * t)),
          );
          tubeGeometry.setDrawRange(
            0,
            Math.min(totalIndexCount, drawnSegments * indicesPerSegment),
          );

          spheres.forEach((sphere, index) => {
            const lit = t >= STAGE_T[index] - 0.005;
            const target = lit ? 1 : 0.18;
            sphere.material.opacity +=
              (target - sphere.material.opacity) * 0.16;
            const scale = lit ? 1.15 : 0.9;
            sphere.scale.x += (scale - sphere.scale.x) * 0.16;
            sphere.scale.y += (scale - sphere.scale.y) * 0.16;
            sphere.scale.z += (scale - sphere.scale.z) * 0.16;
          });

          placePanels(t);

          const nextReached = STAGE_T.filter((stage) => t >= stage - 0.005).length;
          if (nextReached !== reachedCount) {
            reachedCount = nextReached;
            setReached(nextReached);
          }
        };

        const resize = () => {
          const width = Math.max(1, wrap.clientWidth);
          const height = Math.max(1, wrap.clientHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          desktop = window.matchMedia("(min-width: 768px)").matches;
          panelWidths = panelRefs.current.map(
            (panel) => panel?.offsetWidth ?? 300,
          );

          if (!desktop) clearPanelStyles();
          if (staticMode) renderStaticScene();
        };

        resize();
        window.addEventListener("resize", resize);

        if (staticMode) {
          renderStaticScene();
        } else {
          let gsapModule: typeof import("gsap")["default"];
          let ScrollTriggerModule: typeof import("gsap/ScrollTrigger")["ScrollTrigger"];
          try {
            [{ default: gsapModule }, { ScrollTrigger: ScrollTriggerModule }] =
              await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
          } catch {
            setFallback(true);
            window.removeEventListener("resize", resize);
            renderer.dispose();
            return;
          }
          if (cancelled) {
            window.removeEventListener("resize", resize);
            renderer.dispose();
            return;
          }

          gsapModule.registerPlugin(ScrollTriggerModule);
          ScrollTriggerModule.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              progressTarget = self.progress;
            },
            onRefresh: (self) => {
              progressTarget = self.progress;
            },
          });

          let previousTime = performance.now();
          let frame = 0;
          let running = false;

          const tick = () => {
            frame = requestAnimationFrame(tick);
            const now = performance.now();
            const delta = Math.min((now - previousTime) / 1000, 0.05);
            previousTime = now;
            const ease = 1 - Math.exp(-8 * delta);
            progressSmoothed += (progressTarget - progressSmoothed) * ease;
            if (Math.abs(progressTarget - progressSmoothed) < 0.0001) {
              progressSmoothed = progressTarget;
            }
            updateScene(progressSmoothed);
            renderer.render(scene, camera);
          };

          const startLoop = () => {
            if (running || cancelled) return;
            running = true;
            previousTime = performance.now();
            frame = requestAnimationFrame(tick);
          };

          const stopLoop = () => {
            running = false;
            cancelAnimationFrame(frame);
          };

          const visibilityObserver = new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) startLoop();
              else stopLoop();
            },
            { rootMargin: "20% 0px 20% 0px" },
          );
          visibilityObserver.observe(section);

          updateScene(0);
          renderer.render(scene, camera);
          startLoop();

          disposeScene = () => {
            stopLoop();
            visibilityObserver.disconnect();
            window.removeEventListener("resize", resize);
            ScrollTriggerModule.getAll().forEach((instance) => {
              if (instance.trigger === section) instance.kill();
            });
            tubeGeometry.dispose();
            tubeMaterial.dispose();
            spheres.forEach((sphere) => {
              sphere.geometry.dispose();
              sphere.material.dispose();
            });
            renderer.dispose();
            renderer.forceContextLoss();
          };

          return;
        }

        disposeScene = () => {
          window.removeEventListener("resize", resize);
          tubeGeometry.dispose();
          tubeMaterial.dispose();
          spheres.forEach((sphere) => {
            sphere.geometry.dispose();
            sphere.material.dispose();
          });
          renderer.dispose();
          renderer.forceContextLoss();
        };
      } catch {
        if (!cancelled) setFallback(true);
      }
    };

    if ("IntersectionObserver" in window) {
      lazyObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          void start();
        },
        { rootMargin: "80% 0px 80% 0px" },
      );
      lazyObserver.observe(section);
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      lazyObserver?.disconnect();
      disposeScene?.();
    };
  }, [staticMode]);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-heading"
      data-static={isStatic ? "true" : undefined}
      className={`process-section process3d-section ${className}`.trim()}
    >
      <div className="process3d-pin">
        <header className="process3d-header">
          <div className="process-header__lockup">
            <span className="process-eyebrow">My Process</span>
            <ScrollFilterHeading
              as="h2"
              id="process-heading"
              className="process-heading"
            >
              How we work together
            </ScrollFilterHeading>
          </div>
          <div className="process-counter" aria-hidden="true">
            <span className="process-counter__current">
              {String(Math.max(1, Math.min(4, reached))).padStart(2, "0")}
            </span>
            <span className="process-counter__total">/ 04</span>
          </div>
        </header>

        <div className="process3d-stage">
          <div ref={canvasWrapRef} className="process3d-canvas" aria-hidden="true">
            <canvas ref={canvasRef} className="process3d-canvas__surface" />
          </div>

          <div className="process3d-panels">
            {STEPS.map((step, index) => (
              <article
                key={step.id}
                ref={(element) => {
                  panelRefs.current[index] = element;
                }}
                className="process3d-panel"
                style={
                  {
                    "--stage-index": index,
                  } as CSSProperties
                }
              >
                <span className="process3d-panel__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="process3d-panel__title">{step.title}</h3>
                <span className="process3d-panel__rule" aria-hidden="true" />
                <p className="process3d-panel__body">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
