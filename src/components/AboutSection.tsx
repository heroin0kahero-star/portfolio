/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scroll-pinned About story: three portrait stages, two floating glass cards
 * per stage, and a WebGL dissolve between portraits.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PortraitDissolve,
  type DissolveState,
  type PortraitDissolveHandle,
} from "./PortraitDissolve";

gsap.registerPlugin(ScrollTrigger);

type Side = "left" | "right";

interface AboutCard {
  side: Side;
  title: string;
  body?: string;
  list?: string[];
}

interface AboutStage {
  portrait: string;
  alt: string;
  background: [number, number, number];
  caption: string;
  cards: AboutCard[];
}

const PORTRAITS = [
  "/images/projects/imeags/portrait-1-bw.webp",
  "/images/projects/imeags/portrait-2-red.webp",
  "/images/projects/imeags/portrait-3-3d.webp",
] as const;

const PORTRAIT_ALTS = [
  "Black and white portrait of Suman",
  "Illustrated red portrait of Suman",
  "3D-style portrait of Suman",
] as const;

const PORTRAIT_SOURCES = [...PORTRAITS];
const PORTRAIT_LABELS = [...PORTRAIT_ALTS];

const STAGES: AboutStage[] = [
  {
    portrait: PORTRAITS[0],
    alt: PORTRAIT_ALTS[0],
    background: [255, 255, 255],
    caption: "Who I am",
    cards: [
      {
        side: "left",
        title: "Who I am",
        body: "Hi, I'm Suman. I design and build websites, and I help small businesses get found online.",
      },
      {
        side: "right",
        title: "Where I'm from",
        body: "Based in Thalaghattapura, Bangalore, India.",
      },
    ],
  },
  {
    portrait: PORTRAITS[1],
    alt: PORTRAIT_ALTS[1],
    // Sampled from the portrait's edge (the requested #7A0B0E read darker after
    // compression). Matching the edge keeps the photo seam invisible.
    background: [102, 1, 4],
    caption: "What I do",
    cards: [
      {
        side: "left",
        title: "What I do",
        body: "I build websites, manage social media, and run Google and Meta ads for businesses that have little or no online presence.",
      },
      {
        side: "right",
        title: "Experience",
        body: "I'm a new developer, so I'll be upfront: I'm early in my career, but my work is already live. Three client projects are online now, including a clinic, a sports foundation, and a football academy.",
      },
    ],
  },
  {
    portrait: PORTRAITS[2],
    alt: PORTRAIT_ALTS[2],
    background: [0, 0, 0],
    caption: "How I can help",
    cards: [
      {
        side: "left",
        title: "How I can help you",
        body: "I build a website or landing page that fits your business, then make sure customers can find it on Google and on the social platforms they already use.",
      },
      {
        side: "right",
        title: "Services",
        list: [
          "Website and landing page development",
          "SEO setup",
          "Google and Meta ads management",
          "Social media management",
        ],
      },
    ],
  },
];

const TRANSITIONS = [
  {
    start: 0.3,
    end: 0.385,
    from: 0,
    to: 1,
    edgeColor: [1, 1, 1] as [number, number, number],
  },
  {
    start: 0.63,
    end: 0.715,
    from: 1,
    to: 2,
    edgeColor: [1, 0.55, 0.22] as [number, number, number],
  },
];

const CARD_WINDOWS = [
  { enterStart: 0.006, enterEnd: 0.088, exitStart: 0.255, exitEnd: 0.335 },
  { enterStart: 0.385, enterEnd: 0.466, exitStart: 0.583, exitEnd: 0.635 },
  { enterStart: 0.715, enterEnd: 0.798, exitStart: 1.2, exitEnd: 1.3 },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value: number) => Math.pow(value, 3);

function mixColor(
  from: [number, number, number],
  to: [number, number, number],
  amount: number,
): [number, number, number] {
  const t = clamp01(amount);
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

function backgroundFor(progress: number): [number, number, number] {
  const first = TRANSITIONS[0];
  const second = TRANSITIONS[1];

  if (progress < first.start) return STAGES[0].background;
  if (progress <= first.end) {
    return mixColor(
      STAGES[0].background,
      STAGES[1].background,
      (progress - first.start) / (first.end - first.start),
    );
  }
  if (progress < second.start) return STAGES[1].background;
  if (progress <= second.end) {
    return mixColor(
      STAGES[1].background,
      STAGES[2].background,
      (progress - second.start) / (second.end - second.start),
    );
  }
  return STAGES[2].background;
}

function dissolveFor(progress: number): DissolveState {
  for (const transition of TRANSITIONS) {
    if (progress >= transition.start && progress <= transition.end) {
      return {
        from: transition.from,
        to: transition.to,
        progress: clamp01((progress - transition.start) / (transition.end - transition.start)),
        edgeColor: transition.edgeColor,
      };
    }
  }

  if (progress < TRANSITIONS[0].start) {
    return { from: 0, to: 0, progress: 0, edgeColor: [1, 1, 1] };
  }
  if (progress < TRANSITIONS[1].start) {
    return { from: 1, to: 1, progress: 0, edgeColor: [1, 0.55, 0.22] };
  }
  return { from: 2, to: 2, progress: 0, edgeColor: [1, 0.68, 0.34] };
}

function cardTransform(
  side: Side,
  entryProgress: number,
  exitProgress: number,
  canExit: boolean,
  progress: number,
  exitStart: number,
) {
  const entering = easeOutCubic(clamp01(entryProgress));
  const exiting = easeInCubic(clamp01(exitProgress));
  const travel = canExit && progress >= exitStart ? 1 - exiting : entering;
  const opacity = entering * (1 - exiting);

  const startX = side === "left" ? -13 : 13;
  const endX = 0;
  const startRotation = side === "left" ? 24 : -24;
  const endRotation = side === "left" ? 6 : -6;

  const x = startX + (endX - startX) * travel;
  const z = -300 + 300 * travel;
  const rotation = startRotation + (endRotation - startRotation) * travel;

  return {
    opacity,
    transform: `translate3d(${x.toFixed(3)}vw, 0, ${z.toFixed(2)}px) rotateY(${rotation.toFixed(3)}deg)`,
  };
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const dissolveRef = useRef<PortraitDissolveHandle | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef(0);
  const [activeStage, setActiveStage] = useState(0);

  const applyProgress = useCallback((progress: number) => {
    const p = clamp01(progress);
    progressRef.current = p;

    const background = backgroundFor(p);
    const sticky = stickyRef.current;
    if (sticky) {
      sticky.style.backgroundColor = `rgb(${background.join(", ")})`;
      sticky.style.setProperty("--about-edge-rgb", background.join(" "));
      const luminance =
        (0.2126 * background[0] + 0.7152 * background[1] + 0.0722 * background[2]) /
        255;
      const useDarkInk = luminance > 0.6;
      sticky.style.setProperty("--about-ink", useDarkInk ? "#111111" : "#ffffff");
      sticky.style.setProperty(
        "--about-muted",
        useDarkInk ? "rgba(17, 17, 17, 0.62)" : "rgba(255, 255, 255, 0.72)",
      );
    }

    const nextStage = p < 0.385 ? 0 : p < 0.715 ? 1 : 2;
    setActiveStage((current) => (current === nextStage ? current : nextStage));

    dissolveRef.current?.render(dissolveFor(p));

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    STAGES.forEach((stage, stageIndex) => {
      stage.cards.forEach((card, sideIndex) => {
        const cardIndex = stageIndex * 2 + sideIndex;
        const shell = cardRefs.current[cardIndex];
        if (!shell) return;

        if (!isDesktop) {
          shell.style.opacity = "";
          shell.style.transform = "";
          shell.style.pointerEvents = "";
          return;
        }

        if (reducedMotion) {
          const visible = stageIndex === nextStage;
          shell.style.opacity = visible ? "1" : "0";
          shell.style.transform = "none";
          shell.style.pointerEvents = visible ? "auto" : "none";
          return;
        }

        const timing = CARD_WINDOWS[stageIndex];
        const left = card.side === "left";
        const enterStart = timing.enterStart + (left ? 0 : 0.016);
        const enterEnd = timing.enterEnd + (left ? 0 : 0.008);
        const exitStart = timing.exitStart + (left ? 0 : 0.012);
        const exitEnd = timing.exitEnd + (left ? 0 : 0.008);

        const entryProgress = clamp01(
          (p - enterStart) / Math.max(0.001, enterEnd - enterStart),
        );
        const exitProgress = clamp01(
          (p - exitStart) / Math.max(0.001, exitEnd - exitStart),
        );

        const { opacity, transform } = cardTransform(
          card.side,
          entryProgress,
          exitProgress,
          timing.exitStart < 1,
          p,
          exitStart,
        );

        shell.style.opacity = opacity.toFixed(4);
        shell.style.transform = transform;
        shell.style.pointerEvents = opacity > 0.35 ? "auto" : "none";
      });
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => applyProgress(self.progress),
      onRefresh: (self) => applyProgress(self.progress),
    });

    applyProgress(trigger.progress);

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh, { once: true });
    }

    return () => {
      window.removeEventListener("load", refresh);
      trigger.kill();
    };
  }, [applyProgress]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const handleChange = () => applyProgress(progressRef.current);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [applyProgress]);

  return (
    <section
      id="about"
      ref={sectionRef}
      data-stage={activeStage}
      className="about-section relative bg-black"
    >
      <h2 className="sr-only">About Suman</h2>
      <div ref={stickyRef} className="about-sticky sticky top-0 overflow-hidden">
        {/* Stage background wash */}
        <div className="about-stage-glow pointer-events-none absolute inset-0" />

        {/* Portrait dissolve */}
        <div className="about-portrait pointer-events-none">
          <div className="about-portrait__media">
            <PortraitDissolve
              ref={dissolveRef}
              sources={PORTRAIT_SOURCES}
              alts={PORTRAIT_LABELS}
              activeIndex={activeStage}
            />
          </div>
        </div>

        {/* Subtle film grain keeps the flat backgrounds from looking like a slab */}
        <div className="about-grain pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Section chrome */}
        <div className="about-chrome absolute inset-x-0 top-0 z-40 flex items-center justify-between px-6 pt-20 md:px-10 md:pt-24">
          <div className="flex items-center gap-3">
            <span className="about-mark" aria-hidden="true" />
            <span className="about-label">Suman / About</span>
          </div>
          <span className="about-label about-label--right">
            {String(activeStage + 1).padStart(2, "0")} / 03
          </span>
        </div>

        {/* Floating cards */}
        <div className="about-cards pointer-events-none absolute inset-0 z-30">
          {STAGES.map((stage, stageIndex) => (
            <div
              key={stage.caption}
              className="about-stage-cards absolute inset-0"
              data-visible={activeStage === stageIndex}
            >
              {stage.cards.map((card, sideIndex) => {
                const cardIndex = stageIndex * 2 + sideIndex;
                const darkCards = stageIndex === 0;

                return (
                  <div
                    key={card.title}
                    className={`about-card-anchor about-card-anchor--${card.side}`}
                  >
                    <div
                      ref={(element) => {
                        cardRefs.current[cardIndex] = element;
                      }}
                      className="about-card-shell"
                      style={{
                        opacity: 0,
                        transform: "translate3d(0, 0, -300px)",
                      }}
                    >
                      <div
                        className="about-card-float"
                        style={
                          {
                            "--bob-duration": `${5.4 + cardIndex * 0.31}s`,
                            "--bob-delay": `${-0.7 - cardIndex * 0.73}s`,
                          } as React.CSSProperties
                        }
                      >
                        <div
                          className={`about-card about-card--${darkCards ? "dark" : "light"} about-card-tilt`}
                          onPointerMove={(event) => {
                            if (event.pointerType !== "mouse") return;
                            const rect = event.currentTarget.getBoundingClientRect();
                            const x = (event.clientX - rect.left) / rect.width - 0.5;
                            const y = (event.clientY - rect.top) / rect.height - 0.5;
                            event.currentTarget.style.setProperty(
                              "--tilt-y",
                              `${(x * 6).toFixed(2)}deg`,
                            );
                            event.currentTarget.style.setProperty(
                              "--tilt-x",
                              `${(-y * 6).toFixed(2)}deg`,
                            );
                          }}
                          onPointerLeave={(event) => {
                            event.currentTarget.style.setProperty("--tilt-x", "0deg");
                            event.currentTarget.style.setProperty("--tilt-y", "0deg");
                          }}
                        >
                          <span className="about-card__rule" aria-hidden="true" />
                          <h3 className="about-card__title">{card.title}</h3>
                          {card.body ? (
                            <p className="about-card__body">{card.body}</p>
                          ) : null}
                          {card.list ? (
                            <ul className="about-card__list">
                              {card.list.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Stage caption */}
        <div className="about-caption absolute inset-x-0 bottom-0 z-40 px-6 pb-24 md:px-10 md:pb-20">
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-6">
            <div>
              <span className="about-caption__index">
                {String(activeStage + 1).padStart(2, "0")}
              </span>
              <span className="about-caption__label">{STAGES[activeStage].caption}</span>
            </div>
            <div className="about-progress" aria-hidden="true">
              <span
                className="about-progress__fill"
                style={{ transform: `scaleX(${(activeStage + 1) / 3})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
