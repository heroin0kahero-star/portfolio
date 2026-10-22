/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scroll-driven SVG filter reveal for section headings. A blurred + displaced
 * copy of the heading resolves to crisp text over roughly 60vh of scroll.
 * The filter is removed completely once resolved so text stays selectable and
 * sharp. Reduced-motion users see the heading immediately.
 */

import {
  useLayoutEffect,
  useId,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";

const MAX_BLUR = 7;
const MAX_DISPLACEMENT = 18;

interface ScrollFilterHeadingProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  id?: string;
}

export function ScrollFilterHeading({
  children,
  as: Tag = "h2",
  className = "",
  id,
}: ScrollFilterHeadingProps) {
  const headingRef = useRef<HTMLElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const filterId = `scroll-filter-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      heading.style.filter = "none";
      heading.style.willChange = "auto";
      return;
    }

    const apply = (progress: number) => {
      const remaining = 1 - Math.max(0, Math.min(1, progress));
      if (blurRef.current) {
        blurRef.current.setAttribute("stdDeviation", (MAX_BLUR * remaining).toFixed(2));
      }
      if (displacementRef.current) {
        displacementRef.current.setAttribute(
          "scale",
          (MAX_DISPLACEMENT * remaining).toFixed(2),
        );
      }
      if (remaining < 0.015) {
        heading.style.filter = "none";
        heading.style.willChange = "auto";
      } else {
        heading.style.filter = `url(#${filterId})`;
        heading.style.willChange = "filter";
      }
    };

    apply(0);

    let cancelled = false;
    let started = false;
    let trigger: { kill: () => void; progress: number } | null = null;
    let observer: IntersectionObserver | null = null;

    // Load ScrollTrigger only when the heading approaches the viewport so the
    // initial bundle does not carry the plugin.
    const start = async () => {
      if (cancelled || started) return;
      started = true;

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      trigger = ScrollTrigger.create({
        trigger: heading,
        start: "top 88%",
        end: "top 28%",
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      apply(trigger.progress);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          observer = null;
          void start();
        },
        { rootMargin: "120% 0px 120% 0px" },
      );
      observer.observe(heading);
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      trigger?.kill();
      heading.style.filter = "";
      heading.style.willChange = "";
    };
  }, [filterId]);

  return (
    <>
      <Tag
        id={id}
        ref={headingRef}
        className={`scroll-filter-heading ${className}`.trim()}
      >
        {children}
      </Tag>
      <svg
        className="scroll-filter-defs"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.021"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur
              ref={blurRef}
              in="SourceGraphic"
              stdDeviation={MAX_BLUR}
              result="soft"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="soft"
              in2="noise"
              scale={MAX_DISPLACEMENT}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}
