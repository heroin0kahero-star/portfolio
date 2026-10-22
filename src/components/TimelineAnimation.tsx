/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * "How we work together" — a white, pinned process section with a single
 * hand-built S-curve. The path draws with scroll (normalized stroke-dashoffset),
 * four nodes appear as the line reaches them, and each stage's copy slides in
 * beside its node. Desktop pins via a sticky frame; mobile turns the same path
 * vertical; reduced motion shows the finished drawing without pinning.
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

/**
 * Node positions as percentages of the 1440 x 760 path box. The path is drawn
 * through these exact points, so the dots always sit on the line.
 */
const NODES = [
  { x: 14, y: 72 },
  { x: 39, y: 34 },
  { x: 64, y: 70 },
  { x: 87, y: 30 },
] as const;

/** Arc-length fractions (of pathLength=1) where each node is reached. */
const DESKTOP_REACH = [0.11, 0.38, 0.64, 0.9] as const;

const DESKTOP_PATH =
  "M 50 547.2 L 201.6 547.2 " +
  "C 321.6 547.2 441.6 258.4 561.6 258.4 " +
  "C 681.6 258.4 801.6 532 921.6 532 " +
  "C 1041.6 532 1132.8 228 1252.8 228 " +
  "L 1390 228";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TimelineAnimation({ className = "" }: { className?: string }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const mobilePathRef = useRef<SVGPathElement | null>(null);
  const thresholdsRef = useRef<number[]>([...DESKTOP_REACH]);
  const reachedRef = useRef(0);

  const [staticMode, setStaticMode] = useState(prefersReducedMotion);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setStaticMode(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (staticMode) {
      reachedRef.current = STEPS.length;
      setReached(STEPS.length);
      return;
    }

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let cancelled = false;
    let started = false;
    let trigger: { kill: () => void; progress: number } | null = null;
    let observer: IntersectionObserver | null = null;
    let cleanupBreakpoint: (() => void) | null = null;
    let measureFrame = 0;

    const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

    /**
     * Mobile thresholds come from the actual dot positions, so uneven copy
     * lengths still light each node exactly when the line reaches it.
     */
    const measure = () => {
      if (isDesktop()) {
        thresholdsRef.current = [...DESKTOP_REACH];
        return;
      }
      const box = canvas.getBoundingClientRect();
      const height = Math.max(1, box.height);
      const stages = Array.from(
        canvas.querySelectorAll<HTMLElement>(".process-stage"),
      );
      thresholdsRef.current = stages.map((stage) =>
        clamp01((stage.getBoundingClientRect().top - box.top + 12) / height),
      );
    };

    const apply = (scrollProgress: number) => {
      // Leave a short beat at both ends so the line starts and finishes inside
      // the pin rather than snapping on the first/last frame.
      const draw = clamp01((clamp01(scrollProgress) - 0.03) / 0.9);
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = (1 - draw).toFixed(4);
      }
      if (mobilePathRef.current) {
        mobilePathRef.current.style.strokeDashoffset = (1 - draw).toFixed(4);
      }

      const count = thresholdsRef.current.filter(
        (threshold) => draw >= threshold - 0.005,
      ).length;
      if (count !== reachedRef.current) {
        reachedRef.current = count;
        setReached(count);
      }
    };

    const start = async () => {
      if (cancelled || started) return;
      started = true;

      let gsap: typeof import("gsap")["default"];
      let ScrollTrigger: typeof import("gsap/ScrollTrigger")["ScrollTrigger"];
      try {
        [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      } catch {
        // If the motion chunk cannot load, leave the section in its static,
        // fully drawn state rather than a blank white panel.
        if (!cancelled) setStaticMode(true);
        return;
      }
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const build = () => {
        if (cancelled) return;
        trigger?.kill();
        measure();

        const desktop = isDesktop();
        trigger = ScrollTrigger.create({
          trigger: desktop ? section : canvas,
          start: desktop ? "top top" : "top 78%",
          end: desktop ? "bottom bottom" : "bottom 82%",
          onUpdate: (self) => apply(self.progress),
          onRefresh: () => {
            measure();
            if (trigger) apply(trigger.progress);
          },
        });
        apply(trigger.progress);
      };

      const breakpoint = window.matchMedia("(min-width: 768px)");
      breakpoint.addEventListener("change", build);
      cleanupBreakpoint = () => breakpoint.removeEventListener("change", build);
      build();

      document.fonts?.ready
        .then(() => {
          if (cancelled) return;
          measure();
          build();
        })
        .catch(() => {});
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          observer = null;
          void start();
        },
        { rootMargin: "100% 0px 100% 0px" },
      );
      observer.observe(section);
    } else {
      void start();
    }

    const onResize = () => {
      cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(() => {
        measure();
        if (trigger) apply(trigger.progress);
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      observer?.disconnect();
      cancelAnimationFrame(measureFrame);
      window.removeEventListener("resize", onResize);
      cleanupBreakpoint?.();
      trigger?.kill();
    };
  }, [staticMode]);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-heading"
      data-static={staticMode ? "true" : undefined}
      className={`process-section ${className}`.trim()}
    >
      <div className="process-frame">
        <header className="process-header">
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

        <div ref={canvasRef} className="process-canvas">
          <svg
            className="process-line process-line--desktop"
            viewBox="0 0 1440 760"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              ref={pathRef}
              d={DESKTOP_PATH}
              pathLength={1}
              fill="none"
              stroke="#111111"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <svg
            className="process-line process-line--mobile"
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              ref={mobilePathRef}
              d="M 1 0 V 100"
              pathLength={1}
              fill="none"
              stroke="#111111"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="process-nodes" aria-hidden="true">
            {NODES.map((node, index) => (
              <span
                key={STEPS[index].id}
                className="process-node"
                data-reached={index < reached}
                style={
                  {
                    "--x": `${node.x}%`,
                    "--y": `${node.y}%`,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          <div className="process-stages">
            {STEPS.map((step, index) => (
              <article
                key={step.id}
                className="process-stage"
                data-side={index % 2 === 0 ? "above" : "below"}
                data-reached={index < reached}
                style={
                  {
                    "--x": `${NODES[index].x}%`,
                    "--y": `${NODES[index].y}%`,
                  } as CSSProperties
                }
              >
                <div className="process-stage__copy">
                  <span className="process-stage__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="process-stage__title">{step.title}</h3>
                  <span className="process-stage__rule" aria-hidden="true" />
                  <p className="process-stage__body">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
