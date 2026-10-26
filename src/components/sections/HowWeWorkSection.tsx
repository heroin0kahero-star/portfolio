/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * React shell for the plain-JS depth-flight module. The shell owns the section
 * markup; `HowWeWork.js` owns the WebGL canvas, the pinned scroll trigger and
 * every frame. The module is loaded on demand so Three.js never reaches the
 * hero bundle.
 */

import { useEffect, useRef } from "react";
import { stages } from "../../data/stages";
import "../../sections/how-we-work/how-we-work.css";

type HowWeWorkHandle = {
  destroy: () => void;
};

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function HowWeWorkSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const motionQuery = window.matchMedia(MOTION_QUERY);
    let disposed = false;
    let handle: HowWeWorkHandle | null = null;

    const boot = () => {
      if (disposed || motionQuery.matches) return;

      void import("../../sections/how-we-work/HowWeWork.js")
        .then(({ mount }) => {
          if (disposed) return;
          handle = mount(sectionEl);
        })
        .catch(() => {
          if (!disposed) sectionEl.classList.add("hww--static");
        });
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        handle?.destroy();
        handle = null;
        sectionEl.classList.add("hww--static");
        return;
      }

      sectionEl.classList.remove("hww--static");
      boot();
    };

    motionQuery.addEventListener("change", onMotionChange);
    boot();

    return () => {
      disposed = true;
      motionQuery.removeEventListener("change", onMotionChange);
      handle?.destroy();
      handle = null;
    };
  }, []);

  return (
    <div className="hww__scroll">
      <section
        id="process"
        ref={sectionRef}
        className="hww"
        aria-labelledby="process-heading"
      >
        <div
          className="hww__canvas-host"
          data-hww-canvas-host
          aria-hidden="true"
        />

        <header className="hww__intro" data-hww-header>
          <p className="hww__kicker">My process</p>
          <h2 id="process-heading" className="hww__title">
            How we work together
          </h2>
          <p className="hww__lede">
            A clear path from the first conversation to what happens after
            launch. Five stages, one person accountable for the whole build.
          </p>
        </header>

        <aside className="hww__hud" data-hww-hud aria-hidden="true">
          <div className="hww__hud-group">
            <span className="hww__hud-label">Stage</span>
            <span className="hww__hud-count" data-hud-count>
              01
            </span>
            <span className="hww__hud-total">/ 05</span>
          </div>

          <div className="hww__hud-right">
            <span className="hww__hud-caption">Scroll to fly</span>
            <div className="hww__meter">
              {stages.map((stage) => (
                <span className="hww__seg" key={stage.id}>
                  <i data-hud-fill />
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Screen-reader copy stays available in both motion modes. The visible
            reduced-motion list is decorative because this list already carries
            the same text. */}
        <ol className="hww__sr">
          {stages.map((stage) => (
            <li key={stage.id}>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              <p>{stage.tags.join(", ")}</p>
            </li>
          ))}
        </ol>

        <div className="hww__static" aria-hidden="true">
          <div className="hww__static-inner">
            <svg
              className="hww__line"
              viewBox="0 0 200 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M100 0 C 158 80, 42 160, 100 250 S 42 420, 100 510 S 42 680, 100 770 S 42 940, 100 1000"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <ol className="hww__static-list">
              {stages.map((stage) => (
                <li key={stage.id}>
                  <article className="hww__static-card">
                    <div className="hww__static-top">
                      <span>{stage.id}</span>
                      <span>Stage</span>
                    </div>
                    <h3 className="hww__static-title">{stage.title}</h3>
                    <p className="hww__static-text">{stage.text}</p>
                    <ul className="hww__static-tags">
                      {stage.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HowWeWorkSection;
