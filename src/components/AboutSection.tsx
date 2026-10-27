/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scroll-pinned About story: three full-stage portrait scenes, two floating
 * glass cards per scene, and a Codrops-style slice transition between stages.
 *
 * Each stage is a real DOM layer (portrait + cards). A single stack of colour
 * bands covers the whole stage while the layers swap, then uncovers the
 * incoming stage while its portrait settles from a slight zoom.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollFilterHeading } from "./ScrollFilterHeading";
import { MAX_SLICE_BANDS, SliceRevealer } from "./about/SliceRevealer";
import { STAGE_BAND_COLORS, transitionFor } from "./about/slicePresets";
import "./about/about.css";

gsap.registerPlugin(ScrollTrigger);
// Mobile browsers resize the viewport when the address bar shows/hides. The
// About section is sized in svh, so ignoring that resize avoids a scroll jump
// and a full ScrollTrigger re-measure mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

const DESKTOP_QUERY = "(min-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type Side = "left" | "right";
type Tone = "light" | "dark";

interface AboutCard {
  side: Side;
  title: string;
  body?: string;
  list?: string[];
}

interface AboutStage {
  portrait: string;
  alt: string;
  /** Solid stage colour. Matches each portrait's own edge. */
  color: string;
  tone: Tone;
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

// 800px-wide WebP variants. Phones never need the full 1365–1600px files.
const PORTRAIT_MOBILE = [
  "/images/projects/imeags/portrait-1-bw-800.webp",
  "/images/projects/imeags/portrait-2-red-800.webp",
  "/images/projects/imeags/portrait-3-3d-800.webp",
] as const;

const PORTRAIT_WIDTHS = [1365, 1600, 1365];
const PORTRAIT_SRCSETS = PORTRAITS.map(
  (source, index) =>
    `${PORTRAIT_MOBILE[index]} 800w, ${source} ${PORTRAIT_WIDTHS[index]}w`,
);
const PORTRAIT_SIZES = "(min-width: 768px) 100vw, 80vw";

const STAGES: AboutStage[] = [
  {
    portrait: PORTRAITS[0],
    alt: PORTRAIT_ALTS[0],
    color: "#ffffff",
    tone: "light",
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
    color: "#660104",
    tone: "dark",
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
    color: "#111111",
    tone: "dark",
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

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

// Each card drifts at its own rate so a stage's two cards never move as one
// block. Distinct, non-linear values also keep the six cards visually separate.
const CARD_PARALLAX = [92, -104, 112, -96, 86, -116];
const parallaxFor = (index: number) => CARD_PARALLAX[index % CARD_PARALLAX.length];

function cardPose(side: Side, stageProgress: number, index: number) {
  // Cards slide in from their own edge over the first part of a stage, then
  // drift slowly for the rest. Timing is scroll-driven, so a fast wheel burst
  // simply brings them in faster instead of queueing an animation.
  const entry = clamp01(stageProgress / 0.18);
  const eased = 1 - Math.pow(1 - entry, 3);
  const direction = side === "left" ? -1 : 1;
  const x = direction * 14 * (1 - eased);
  const z = -160 * (1 - eased);
  const rotationY = -direction * 16 * (1 - eased);
  const y = parallaxFor(index) * (stageProgress - 0.5);

  return {
    opacity: eased,
    transform: `translate3d(${x.toFixed(3)}vw, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotationY.toFixed(3)}deg)`,
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

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const stageLayerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const bandsLayerRef = useRef<HTMLDivElement | null>(null);
  const bandRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const portraitRefs = useRef<Array<HTMLImageElement | null>>([]);
  const cardShellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardMotionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const revealerRef = useRef<SliceRevealer | null>(null);

  const activeStageRef = useRef(0);
  const targetStageRef = useRef(0);
  const transitioningRef = useRef(false);
  const progressRef = useRef(0);
  const isDesktopRef = useRef(
    typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches,
  );
  const reducedMotionRef = useRef(
    typeof window !== "undefined" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  const [activeStage, setActiveStage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(reducedMotionRef.current);
  const [imagesReady, setImagesReady] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Card pose / reset                                                       */
  /* ---------------------------------------------------------------------- */

  const resetCardStage = useCallback((stageIndex: number) => {
    for (let sideIndex = 0; sideIndex < 2; sideIndex += 1) {
      const index = stageIndex * 2 + sideIndex;
      const shell = cardShellRefs.current[index];
      const motion = cardMotionRefs.current[index];

      if (motion) {
        gsap.killTweensOf(motion);
        motion.style.removeProperty("opacity");
        motion.style.removeProperty("transform");
      }
      if (shell) {
        shell.style.removeProperty("opacity");
        shell.style.removeProperty("transform");
        shell.style.removeProperty("pointer-events");
      }
    }
  }, []);

  const applyCardProgress = useCallback(
    (progress: number, stageIndex: number) => {
      if (!isDesktopRef.current || reducedMotionRef.current) return;

      const start = stageIndex / 3;
      const stageProgress = clamp01((progress - start) * 3);

      STAGES[stageIndex].cards.forEach((card, sideIndex) => {
        const index = stageIndex * 2 + sideIndex;
        const shell = cardShellRefs.current[index];
        if (!shell) return;

        const pose = cardPose(card.side, stageProgress, index);
        shell.style.opacity = pose.opacity.toFixed(4);
        shell.style.transform = pose.transform;
        shell.style.pointerEvents = pose.opacity > 0.35 ? "auto" : "none";
      });
    },
    [],
  );

  /**
   * A small timed flourish layered on the inner wrapper. It never touches the
   * scroll-driven shell transform, so the two motions cannot fight.
   */
  const playCardFlourish = useCallback((stageIndex: number) => {
    if (!isDesktopRef.current || reducedMotionRef.current) return;

    const motions = [
      cardMotionRefs.current[stageIndex * 2],
      cardMotionRefs.current[stageIndex * 2 + 1],
    ].filter((element): element is HTMLDivElement => Boolean(element));
    if (!motions.length) return;

    gsap.killTweensOf(motions);
    gsap.fromTo(
      motions,
      {
        scale: 0.94,
        y: (index: number) => (index % 2 === 0 ? -10 : 12),
        rotationY: (index: number) => (index % 2 === 0 ? 8 : -8),
      },
      {
        scale: 1,
        y: 0,
        rotationY: 0,
        duration: 0.72,
        ease: "power3.out",
        stagger: 0.06,
        overwrite: true,
        clearProps: "opacity,transform",
      },
    );
  }, []);

  const swapStage = useCallback(
    (to: number) => {
      if (to === activeStageRef.current) return;

      resetCardStage(activeStageRef.current);
      resetCardStage(to);
      activeStageRef.current = to;
      setActiveStage(to);
      applyCardProgress(progressRef.current, to);
    },
    [applyCardProgress, resetCardStage],
  );

  const zoomPortrait = useCallback((stageIndex: number) => {
    if (reducedMotionRef.current) return;

    const image = portraitRefs.current[stageIndex];
    if (!image) return;

    gsap.killTweensOf(image);
    gsap.fromTo(
      image,
      { scale: 1.2 },
      {
        scale: 1,
        duration: 0.9,
        delay: 0.35,
        ease: "power3.out",
        overwrite: true,
        clearProps: "transform",
      },
    );
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Stage switching                                                         */
  /* ---------------------------------------------------------------------- */

  const runTransition = useCallback(async () => {
    const revealer = revealerRef.current;
    if (!revealer || transitioningRef.current) return;

    transitioningRef.current = true;

    try {
      while (targetStageRef.current !== activeStageRef.current) {
        if (reducedMotionRef.current) break;

        const from = activeStageRef.current;
        const to = targetStageRef.current;
        const preset = transitionFor(from, to);

        // Bands are the incoming stage's colour, so the cover already reads as
        // the next scene rather than as a neutral wipe.
        await revealer.cover(preset, STAGE_BAND_COLORS[to]);

        if (reducedMotionRef.current) break;

        // The user may have scrolled back while the cover was running. In that
        // case simply uncover the stage that is still there.
        if (targetStageRef.current === from) {
          await revealer.reveal(preset);
          break;
        }

        // If the scroll target moved on during the cover, repaint the bands for
        // the latest stage and reveal that directly instead of flashing the
        // intermediate stage first.
        const latest = targetStageRef.current;
        const finalPreset =
          latest === to ? preset : transitionFor(from, latest);

        if (latest !== to) {
          revealer.restage(finalPreset, STAGE_BAND_COLORS[latest]);
        }

        swapStage(latest);
        playCardFlourish(latest);
        zoomPortrait(latest);

        await revealer.reveal(finalPreset);
      }
    } finally {
      transitioningRef.current = false;
    }
  }, [playCardFlourish, swapStage, zoomPortrait]);

  const applyProgress = useCallback(
    (progress: number) => {
      const p = clamp01(progress);
      progressRef.current = p;

      const nextStage = Math.min(2, Math.floor(p * 3));
      targetStageRef.current = nextStage;

      if (reducedMotionRef.current) {
        // Reduced motion skips the bands entirely; CSS crossfades the stage
        // layers over 300ms as the active index changes.
        swapStage(nextStage);
      } else if (
        nextStage !== activeStageRef.current &&
        !transitioningRef.current
      ) {
        void runTransition();
      }

      // Card motion is scrubbed by the same scroll position as the stage
      // selection. Mobile and reduced-motion layouts are handled by CSS.
      applyCardProgress(p, activeStageRef.current);
    },
    [applyCardProgress, runTransition, swapStage],
  );

  /* ---------------------------------------------------------------------- */
  /* Reduced-motion switch                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;

    if (!reducedMotion) return;

    targetStageRef.current = activeStageRef.current;
    // A pending transition may still be awaiting a band tween. Its loop checks
    // the reduced-motion ref after every await and exits on its own.
    transitioningRef.current = false;
    revealerRef.current?.cancel();

    // The scroll-driven card poses are inline styles. Clear them so the plain
    // reduced-motion layout is not left with a half-entered card.
    cardMotionRefs.current.forEach((motion) => {
      if (!motion) return;
      gsap.killTweensOf(motion);
      motion.style.removeProperty("opacity");
      motion.style.removeProperty("transform");
    });
    cardShellRefs.current.forEach((shell) => {
      if (!shell) return;
      shell.style.removeProperty("opacity");
      shell.style.removeProperty("transform");
      shell.style.removeProperty("pointer-events");
    });
  }, [reducedMotion]);

  /* ---------------------------------------------------------------------- */
  /* Decode portraits before the pinned scroll is measured                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const decodePortraits = async () => {
      const images = portraitRefs.current.filter(
        (image): image is HTMLImageElement => Boolean(image),
      );

      await Promise.all(
        images.map((image) =>
          image.decode ? image.decode().catch(() => undefined) : Promise.resolve(),
        ),
      );

      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready.catch(() => undefined);
      }

      if (!cancelled) setImagesReady(true);
    };

    void decodePortraits();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Slice overlay engine                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const overlay = overlayRef.current;
    const layer = bandsLayerRef.current;
    const bands = bandRefs.current.filter(
      (band): band is HTMLSpanElement => Boolean(band),
    );

    if (!overlay || !layer || !bands.length) return;

    revealerRef.current = new SliceRevealer(overlay, layer, bands);

    return () => {
      revealerRef.current?.destroy();
      revealerRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* ScrollTrigger                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !imagesReady) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => applyProgress(self.progress),
      onRefresh: (self) => applyProgress(self.progress),
      onToggle: (self) => {
        document.documentElement.classList.toggle(
          "about-has-edge-blur",
          self.isActive,
        );
      },
    });

    applyProgress(trigger.progress);
    document.documentElement.classList.toggle(
      "about-has-edge-blur",
      trigger.isActive,
    );

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
  }, [applyProgress, imagesReady]);

  /* ---------------------------------------------------------------------- */
  /* Desktop / resize changes                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = () => {
      isDesktopRef.current = query.matches;

      cardShellRefs.current.forEach((shell) => {
        if (!shell) return;
        shell.style.removeProperty("opacity");
        shell.style.removeProperty("transform");
        shell.style.removeProperty("pointer-events");
      });
      cardMotionRefs.current.forEach((motion) => {
        if (!motion) return;
        gsap.killTweensOf(motion);
        motion.style.removeProperty("opacity");
        motion.style.removeProperty("transform");
      });

      applyCardProgress(progressRef.current, activeStageRef.current);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [applyCardProgress]);

  useEffect(
    () => () => {
      gsap.killTweensOf(cardMotionRefs.current.filter(Boolean));
      portraitRefs.current.forEach((image) => {
        if (image) gsap.killTweensOf(image);
      });
    },
    [],
  );

  const tone: Tone = STAGES[activeStage].tone;

  return (
    <section
      id="about"
      ref={sectionRef}
      data-stage={activeStage}
      className="about-section relative bg-black"
    >
      <div
        ref={stickyRef}
        data-tone={tone}
        className="about-sticky sticky top-0 overflow-hidden"
      >
        {/* One real layer per stage. Only the active layer is visible at rest. */}
        <div
          ref={stageLayerRef}
          className={`about-stages${reducedMotion ? " about-stages--fade" : ""}`}
        >
          {STAGES.map((stage, stageIndex) => (
            <div
              key={stage.caption}
              className="about-stage"
              data-visible={activeStage === stageIndex}
              aria-hidden={activeStage !== stageIndex}
              data-tone={stage.tone}
              style={{ backgroundColor: stage.color }}
            >
              <div className="about-stage__portrait">
                <img
                  ref={(element) => {
                    portraitRefs.current[stageIndex] = element;
                  }}
                  className="about-portrait-image"
                  src={stage.portrait}
                  srcSet={PORTRAIT_SRCSETS[stageIndex]}
                  sizes={PORTRAIT_SIZES}
                  alt={stage.alt}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>

              <div className="about-stage__cards">
                {stage.cards.map((card, sideIndex) => {
                  const cardIndex = stageIndex * 2 + sideIndex;

                  return (
                    <div
                      key={card.title}
                      className={`about-card-anchor about-card-anchor--${card.side}`}
                    >
                      <div
                        ref={(element) => {
                          cardShellRefs.current[cardIndex] = element;
                        }}
                        className="about-card-shell"
                        style={{
                          opacity: 0,
                          transform:
                            card.side === "left"
                              ? "translate3d(-14vw, 0, -160px) rotateY(16deg)"
                              : "translate3d(14vw, 0, -160px) rotateY(-16deg)",
                        }}
                      >
                        <div
                          ref={(element) => {
                            cardMotionRefs.current[cardIndex] = element;
                          }}
                          className="about-card-motion"
                        >
                          <div
                            className="about-card-float"
                            style={
                              {
                                "--bob-duration": `${5.4 + cardIndex * 0.31}s`,
                                "--bob-delay": `${-0.7 - cardIndex * 0.73}s`,
                              } as CSSProperties
                            }
                          >
                            <div
                              className={`about-card about-card--${stage.tone === "light" ? "dark" : "light"} about-card-tilt`}
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
                              <span
                                className="about-card__stage"
                                aria-hidden="true"
                              >
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
            </div>
          ))}
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
            <ScrollFilterHeading className="about-label">
              About me
            </ScrollFilterHeading>
          </div>
          <span className="about-label about-label--right">
            {String(activeStage + 1).padStart(2, "0")} / 03
          </span>
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

        {/* Full-stage slice cover. Bands are created once and reused. */}
        <div
          ref={overlayRef}
          className="about-slice-overlay"
          data-visible="false"
          aria-hidden="true"
        >
          <div
            ref={bandsLayerRef}
            className="about-slice-overlay__bands about-slice-overlay__bands--horizontal"
          >
            {Array.from({ length: MAX_SLICE_BANDS }, (_, index) => (
              <span
                key={index}
                ref={(element) => {
                  bandRefs.current[index] = element;
                }}
                className="about-slice-band"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
