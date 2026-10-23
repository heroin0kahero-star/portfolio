/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scroll-pinned About story: three 16:9 portrait stages, two floating glass
 * cards per stage, and a horizontal-blind transition between portraits.
 *
 * The portrait frame keeps a fixed 16:9 aspect ratio at every breakpoint. The
 * blind slices are separate elements, so the portraits themselves are only
 * ever cropped by object-fit: cover and can never stretch.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PortraitBlinds,
  type BlindsState,
  type PortraitBlindsHandle,
} from "./PortraitBlinds";
import { ScrollFilterHeading } from "./ScrollFilterHeading";

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

// Each transition scrubs across a quarter of the pinned scroll.
const TRANSITIONS = [
  { start: 0.17, end: 0.42, from: 0, to: 1 },
  { start: 0.58, end: 0.83, from: 1, to: 2 },
];

// Cards arrive after the portrait transition has finished, hold through the
// middle of the stage, then leave as the next transition begins.
const CARD_WINDOWS = [
  { enterStart: 0.005, enterEnd: 0.075, exitStart: 0.14, exitEnd: 0.17 },
  { enterStart: 0.42, enterEnd: 0.5, exitStart: 0.55, exitEnd: 0.58 },
  { enterStart: 0.83, enterEnd: 0.91, exitStart: 1.2, exitEnd: 1.3 },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value: number) => Math.pow(value, 3);

// Each card drifts at its own rate so a stage's two cards never move as one
// block. Distinct, non-linear values also keep the six cards visually separate.
const CARD_PARALLAX = [148, -132, 174, -156, 126, -170];
const parallaxFor = (index: number) => CARD_PARALLAX[index % CARD_PARALLAX.length];

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

function blindsFor(progress: number): BlindsState {
  for (const transition of TRANSITIONS) {
    if (progress >= transition.start && progress <= transition.end) {
      return {
        from: transition.from,
        to: transition.to,
        progress: clamp01(
          (progress - transition.start) / (transition.end - transition.start),
        ),
      };
    }
  }

  if (progress < TRANSITIONS[0].start) {
    return { from: 0, to: 0, progress: 0 };
  }
  if (progress < TRANSITIONS[1].start) {
    return { from: 1, to: 1, progress: 0 };
  }
  return { from: 2, to: 2, progress: 0 };
}

function cardTransform(
  side: Side,
  entryProgress: number,
  exitProgress: number,
  canExit: boolean,
  progress: number,
  parallax: number,
) {
  const entering = easeOutCubic(clamp01(entryProgress));
  const exiting = easeInCubic(clamp01(exitProgress));
  const travel = canExit && exitProgress > 0 ? 1 - exiting : entering;
  const opacity = entering * (1 - exiting);

  const startX = side === "left" ? -13 : 13;
  const endX = 0;
  const startRotation = side === "left" ? 24 : -24;
  const endRotation = side === "left" ? 6 : -6;

  const x = startX + (endX - startX) * travel;
  const z = -300 + 300 * travel;
  const rotation = startRotation + (endRotation - startRotation) * travel;
  // Anchored to the middle of the scroll so cards drift around the stage rather
  // than accumulating an offset on stages that have no exit window.
  const y = parallax * (progress - 0.5);

  return {
    opacity,
    transform: `translate3d(${x.toFixed(3)}vw, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotation.toFixed(3)}deg)`,
  };
}

function EdgeBlur({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      className={`about-edge-blur about-edge-blur--${edge}`}
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((layer) => (
        <span key={layer} className="about-edge-blur__layer" />
      ))}
    </div>
  );
}

function StaticAboutSection() {
  return (
    <section
      id="about"
      className="about-section about-section--static relative"
      aria-label="About me"
    >
      <div className="about-static">
        {STAGES.map((stage, stageIndex) => {
          const onLight = stageIndex === 0;
          const cardTone = onLight ? "dark" : "light";

          return (
            <div
              key={stage.caption}
              className="about-static__stage"
              data-tone={onLight ? "light" : "dark"}
              style={{ backgroundColor: `rgb(${stage.background.join(", ")})` }}
            >
              <div className="about-static__chrome">
                <div className="flex items-center gap-3">
                  <span className="about-mark" aria-hidden="true" />
                  <span className="about-label">About me</span>
                </div>
                <span className="about-label about-label--right">
                  {String(stageIndex + 1).padStart(2, "0")} / 03
                </span>
              </div>

              <div className="about-static__body">
                <div className="about-static__portrait">
                  <img
                    src={stage.portrait}
                    alt={stage.alt}
                    loading={stageIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>

                <div className="about-static__cards">
                  {stage.cards.map((card) => (
                    <div
                      key={card.title}
                      className={`about-card about-card--${cardTone}`}
                    >
                      <span className="about-card__stage" aria-hidden="true">
                        {String(stageIndex + 1).padStart(2, "0")} / 03
                      </span>
                      <h3 className="about-card__title">{card.title}</h3>
                      <span className="about-card__underline" aria-hidden="true" />
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
                  ))}
                </div>
              </div>

              <div className="about-static__caption">
                <span className="about-caption__index">
                  {String(stageIndex + 1).padStart(2, "0")}
                </span>
                <span className="about-caption__label">{stage.caption}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const blindsRef = useRef<PortraitBlindsHandle | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const motionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef(0);
  const activeStageRef = useRef(0);
  const initialisedRef = useRef(false);
  const motionModeRef = useRef<"motion" | "static" | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  /**
   * Flip-style stage change, layered on an inner wrapper so it never competes
   * with the per-frame scroll transforms on the card shell.
   *
   * GSAP Flip is installed, but Flip.getState() misreads the bounds of a card
   * nested inside the shell's perspective + rotateY transform (offsets of
   * several hundred pixels). This is the manual FLIP path instead: capture the
   * rest pose in JS, animate in from an offset pose, and animate the outgoing
   * pair out, all with transforms so the scroll path never reads layout.
   */
  const playCardFlip = useCallback((stageIndex: number) => {
    const incoming = [
      motionRefs.current[stageIndex * 2],
      motionRefs.current[stageIndex * 2 + 1],
    ].filter((element): element is HTMLDivElement => Boolean(element));
    if (!incoming.length) return;

    const outgoing: HTMLDivElement[] = [];
    motionRefs.current.forEach((element, index) => {
      if (!element) return;
      if (Math.floor(index / 2) !== stageIndex) outgoing.push(element);
    });

    gsap.killTweensOf([...incoming, ...outgoing]);

    if (outgoing.length) {
      gsap.to(outgoing, {
        opacity: 0,
        scale: 0.92,
        y: (index: number) => (index % 2 === 0 ? -12 : 14),
        duration: 0.34,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => gsap.set(outgoing, { clearProps: "opacity,transform" }),
      });
    }

    const sign = stageIndex % 2 === 0 ? -1 : 1;
    gsap.fromTo(
      incoming,
      {
        opacity: 0,
        scale: 0.84,
        y: (index: number) => (index % 2 === 0 ? -14 : 16),
        rotationY: sign * 12,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotationY: 0,
        duration: 0.78,
        ease: "power3.out",
        stagger: 0.06,
        overwrite: true,
        clearProps: "opacity,transform",
      },
    );
  }, []);

  const applyProgress = useCallback(
    (progress: number) => {
      const p = clamp01(progress);
      progressRef.current = p;

      const background = backgroundFor(p);
      const blinds = blindsFor(p);
      const sticky = stickyRef.current;
      if (sticky) {
        sticky.style.backgroundColor = `rgb(${background.join(", ")})`;
        sticky.style.setProperty("--about-edge-rgb", background.join(" "));
        // The portrait frame sits on the incoming stage colour while the
        // outgoing slices collapse, so any seam reads as the next stage.
        sticky.style.setProperty(
          "--about-next-rgb",
          STAGES[blinds.to].background.join(" "),
        );
        const luminance =
          (0.2126 * background[0] +
            0.7152 * background[1] +
            0.0722 * background[2]) /
          255;
        const useDarkInk = luminance > 0.6;
        sticky.style.setProperty(
          "--about-ink",
          useDarkInk ? "#111111" : "#ffffff",
        );
        sticky.style.setProperty(
          "--about-muted",
          useDarkInk ? "rgba(17, 17, 17, 0.62)" : "rgba(255, 255, 255, 0.72)",
        );
      }

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const motionMode = isDesktop && !reducedMotion ? "motion" : "static";

      // Leaving motion mode (resize below 1024px or reduced motion turned on)
      // must not leave a half-finished flip transform on a wrapper.
      if (motionModeRef.current !== motionMode) {
        motionModeRef.current = motionMode;
        gsap.killTweensOf(motionRefs.current.filter(Boolean));
        motionRefs.current.forEach((element) => {
          if (!element) return;
          element.style.removeProperty("opacity");
          element.style.removeProperty("transform");
        });
      }

      const nextStage =
        p < TRANSITIONS[0].end ? 0 : p < TRANSITIONS[1].end ? 1 : 2;
      let flipStage: number | null = null;

      if (activeStageRef.current !== nextStage) {
        const wasInitialised = initialisedRef.current;
        activeStageRef.current = nextStage;
        setActiveStage(nextStage);
        if (wasInitialised && motionMode === "motion") flipStage = nextStage;
      }
      initialisedRef.current = true;

      blindsRef.current?.render(blinds);

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
            parallaxFor(cardIndex),
          );

          shell.style.opacity = opacity.toFixed(4);
          shell.style.transform = transform;
          shell.style.pointerEvents = opacity > 0.35 ? "auto" : "none";
        });
      });

      // The entrance runs after the shells settle into their new frame so the
      // incoming cards animate in from the pose they are actually entering from.
      if (flipStage !== null) playCardFlip(flipStage);
    },
    [playCardFlip, reducedMotion],
  );

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.remove("about-has-edge-blur");
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        applyProgress(self.progress);
        document.documentElement.classList.toggle(
          "about-has-edge-blur",
          self.isActive || self.progress > 0,
        );
      },
      onRefresh: (self) => applyProgress(self.progress),
      onToggle: (self) => {
        document.documentElement.classList.toggle(
          "about-has-edge-blur",
          self.isActive,
        );
      },
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
      document.documentElement.classList.remove("about-has-edge-blur");
    };
  }, [applyProgress, reducedMotion]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => applyProgress(progressRef.current);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [applyProgress]);

  useEffect(
    () => () => {
      gsap.killTweensOf(motionRefs.current.filter(Boolean));
    },
    [],
  );

  if (reducedMotion) {
    return <StaticAboutSection />;
  }

  return (
    <section
      id="about"
      ref={sectionRef}
      data-stage={activeStage}
      className="about-section relative bg-black"
    >
      <div ref={stickyRef} className="about-sticky sticky top-0 overflow-hidden">
        {/* Stage background wash */}
        <div className="about-stage-glow pointer-events-none absolute inset-0" />

        {/* 16:9 portrait with ten-slice blind transition */}
        <div className="about-portrait pointer-events-none">
          <div className="about-portrait__media">
            <PortraitBlinds
              ref={blindsRef}
              sources={PORTRAIT_SOURCES}
              alts={PORTRAIT_LABELS}
              activeIndex={activeStage}
            />
          </div>
        </div>

        {/* Four progressive blur layers at the top and bottom edges */}
        <EdgeBlur edge="top" />
        <EdgeBlur edge="bottom" />

        {/* Subtle film grain keeps the flat backgrounds from looking like a slab */}
        <div
          className="about-grain pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        {/* Section chrome */}
        <div className="about-chrome absolute inset-x-0 top-0 z-40 flex items-center justify-between px-6 pt-20 md:px-10 md:pt-24">
          <div className="flex items-center gap-3">
            <span className="about-mark" aria-hidden="true" />
            <ScrollFilterHeading className="about-label">About me</ScrollFilterHeading>
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
                        ref={(element) => {
                          motionRefs.current[cardIndex] = element;
                        }}
                        className="about-card-motion"
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
                              const rect =
                                event.currentTarget.getBoundingClientRect();
                              const x =
                                (event.clientX - rect.left) / rect.width - 0.5;
                              const y =
                                (event.clientY - rect.top) / rect.height - 0.5;
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
                              event.currentTarget.style.setProperty(
                                "--tilt-x",
                                "0deg",
                              );
                              event.currentTarget.style.setProperty(
                                "--tilt-y",
                                "0deg",
                              );
                            }}
                          >
                            <span className="about-card__stage" aria-hidden="true">
                              {String(stageIndex + 1).padStart(2, "0")} / 03
                            </span>
                            <h3 className="about-card__title">{card.title}</h3>
                            <span
                              className="about-card__underline"
                              aria-hidden="true"
                            />
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
              <span className="about-caption__label">
                {STAGES[activeStage].caption}
              </span>
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
