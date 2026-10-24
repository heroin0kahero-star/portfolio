/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Window/portal transitions between sections. Each stage is a normal block in
 * document flow; as the next stage enters, the outgoing stage recedes while the
 * incoming stage opens from a centred clip window and its contents settle from
 * 1.3× back to 1×.
 *
 * The effect is scrubbed directly from scroll, so it reverses naturally. It does
 * not add another pin, which keeps the About and Process sticky pins mutually
 * exclusive.
 */

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./portal.css";

gsap.registerPlugin(ScrollTrigger);

export function PortalStage({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="portal-stage" data-portal-stage={name}>
      <div className="portal-stage__frame">
        <div className="portal-stage__content">{children}</div>
      </div>
    </div>
  );
}

const BOUNDARIES = [
  { from: "about", to: "process" },
  { from: "process", to: "capabilities" },
  { from: "capabilities", to: "live-builds" },
  { from: "live-builds", to: "pricing" },
  { from: "pricing", to: "footer" },
] as const;

type PortalElements = {
  stage: HTMLElement;
  frame: HTMLElement;
  content: HTMLElement;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function readElements(name: string): PortalElements | null {
  const stage = document.querySelector<HTMLElement>(
    `[data-portal-stage="${name}"]`,
  );
  const frame = stage?.querySelector<HTMLElement>(".portal-stage__frame");
  const content = stage?.querySelector<HTMLElement>(".portal-stage__content");
  if (!stage || !frame || !content) return null;
  return { stage, frame, content };
}

function resetElement(element: HTMLElement) {
  element.style.removeProperty("transform");
  element.style.removeProperty("opacity");
  element.style.removeProperty("filter");
  element.style.removeProperty("clip-path");
  element.style.removeProperty("will-change");
}

function resetOutgoing(elements: PortalElements) {
  elements.frame.style.removeProperty("transform");
  elements.frame.style.removeProperty("opacity");
  elements.frame.style.removeProperty("filter");
  elements.frame.style.removeProperty("will-change");
  elements.stage.classList.remove("portal-stage--exiting");
}

function resetIncoming(elements: PortalElements) {
  elements.frame.style.removeProperty("clip-path");
  elements.frame.style.removeProperty("will-change");
  elements.content.style.removeProperty("transform");
  elements.content.style.removeProperty("opacity");
  elements.content.style.removeProperty("will-change");
  elements.stage.classList.remove("portal-stage--entering");
}

function resetElements(elements: PortalElements) {
  resetOutgoing(elements);
  resetIncoming(elements);
}

export function SectionPortals() {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const stages = BOUNDARIES.map((boundary) => ({
      boundary,
      from: readElements(boundary.from),
      to: readElements(boundary.to),
    })).filter(
      (
        entry,
      ): entry is {
        boundary: (typeof BOUNDARIES)[number];
        from: PortalElements;
        to: PortalElements;
      } => Boolean(entry.from && entry.to),
    );

    if (!stages.length) return;

    const triggers: ScrollTrigger[] = [];
    let cancelled = false;

    const apply = (
      progress: number,
      from: PortalElements,
      to: PortalElements,
    ) => {
      const p = clamp01(progress);

      if (p <= 0.001 || p >= 0.999) {
        resetOutgoing(from);
        resetIncoming(to);
        return;
      }

      const mobile = window.innerWidth < 768;
      const insetX = (mobile ? 6.5 : 8.5) * (1 - p);
      const insetY = (mobile ? 9.5 : 12) * (1 - p);
      const radius = (mobile ? 20 : 30) * (1 - p);

      // Outgoing: recede into a dim, slightly smaller frame behind the portal.
      from.frame.style.transform = `scale(${(1 - p * 0.055).toFixed(4)})`;
      from.frame.style.opacity = (1 - p * 0.18).toFixed(4);
      from.frame.style.filter = `brightness(${(1 - p * 0.58).toFixed(3)}) saturate(${(1 - p * 0.32).toFixed(3)})`;

      // Incoming: a centred window that opens as the content settles.
      to.frame.style.clipPath = `inset(${insetY.toFixed(2)}% ${insetX.toFixed(2)}% ${insetY.toFixed(2)}% ${insetX.toFixed(2)}% round ${radius.toFixed(2)}px)`;
      to.content.style.transform = `scale(${(1 + 0.3 * (1 - p)).toFixed(4)})`;
      to.content.style.opacity = (0.62 + 0.38 * p).toFixed(4);
    };

    stages.forEach(({ boundary, from, to }) => {
      const trigger = ScrollTrigger.create({
        trigger: to.stage,
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => apply(self.progress, from, to),
        onRefresh: (self) => apply(self.progress, from, to),
        onToggle: (self) => {
          from.stage.classList.toggle(
            "portal-stage--exiting",
            self.isActive,
          );
          to.stage.classList.toggle("portal-stage--entering", self.isActive);
          apply(self.progress, from, to);
        },
      });

      triggers.push(trigger);
    });

    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    // Lazy sections and webfonts can change section heights after the first
    // trigger pass. Refreshing on load, font settlement and late DOM swaps keeps
    // each boundary aligned to the final layout without adding another pin.
    let refreshTimer = 0;
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(refresh, 160);
    };

    const mutationObserver = new MutationObserver(scheduleRefresh);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const timerOne = window.setTimeout(refresh, 600);
    const timerTwo = window.setTimeout(refresh, 1800);
    window.addEventListener("load", refresh);
    void document.fonts?.ready.then(refresh).catch(() => undefined);

    refresh();

    return () => {
      cancelled = true;
      window.clearTimeout(refreshTimer);
      window.clearTimeout(timerOne);
      window.clearTimeout(timerTwo);
      window.removeEventListener("load", refresh);
      mutationObserver.disconnect();
      triggers.forEach((trigger) => trigger.kill());
      stages.forEach(({ from, to }) => {
        resetElements(from);
        resetElements(to);
      });
      document
        .querySelectorAll<HTMLElement>(".portal-stage")
        .forEach((stage) => {
          const frame = stage.querySelector<HTMLElement>(
            ".portal-stage__frame",
          );
          const content = stage.querySelector<HTMLElement>(
            ".portal-stage__content",
          );
          if (frame) resetElement(frame);
          if (content) resetElement(content);
          stage.classList.remove(
            "portal-stage--entering",
            "portal-stage--exiting",
          );
        });
    };
  }, []);

  return null;
}
