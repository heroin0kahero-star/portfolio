/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Background R3F canvas for the pinned About section. Holds the three
 * portraits and runs the shader reveal between the active pair.
 */

import { Suspense, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ImageReveal, type ImageRevealHandle } from "./ImageReveal";

export interface RevealState {
  from: number;
  to: number;
  progress: number;
}

interface AboutPortraitSceneProps {
  sources: readonly string[];
  mobileSources: readonly string[];
  revealRef: RefObject<RevealState>;
  active: boolean;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

interface RevealSceneProps {
  sources: readonly string[];
  mobileSources: readonly string[];
  revealRef: RefObject<RevealState>;
  active: boolean;
}

function RevealScene({
  sources,
  mobileSources,
  revealRef,
  active,
}: RevealSceneProps) {
  const handles = useRef<Array<ImageRevealHandle | null>>([null, null, null]);
  const baseRef = useRef(0);
  const incomingRef = useRef<number | null>(null);
  const incomingProgressRef = useRef(0);
  const lastTransitionRef = useRef<RevealState | null>(null);
  const { size } = useThree();
  const isMobile = size.width < 768;
  const urls = isMobile ? mobileSources : sources;

  useFrame(({ clock }, delta) => {
    if (!active) return;

    const state = revealRef.current;
    // Frame-rate independent version of `current += (target - current) * 0.08`
    // at 60fps, clamped so returning to the tab does not snap.
    const smoothing = 1 - Math.pow(0.92, Math.min(delta, 0.05) * 60);
    const inTransition = state.from !== state.to;

    if (inTransition) {
      if (
        baseRef.current !== state.from ||
        incomingRef.current !== state.to
      ) {
        baseRef.current = state.from;
        incomingRef.current = state.to;
        incomingProgressRef.current = clamp01(state.progress);
      }

      lastTransitionRef.current = { ...state };

      const target = clamp01(state.progress);
      incomingProgressRef.current +=
        (target - incomingProgressRef.current) * smoothing;
      incomingProgressRef.current = clamp01(incomingProgressRef.current);
    } else if (incomingRef.current !== null) {
      const lastTransition = lastTransitionRef.current;

      if (lastTransition && lastTransition.progress >= 0.5) {
        // The scroll finished moving forwards: let the incoming portrait
        // finish growing, then promote it and hide the outgoing plane.
        incomingProgressRef.current +=
          (1 - incomingProgressRef.current) * smoothing;

        if (incomingProgressRef.current >= 0.998) {
          baseRef.current = incomingRef.current;
          incomingRef.current = null;
          incomingProgressRef.current = 1;
          lastTransitionRef.current = null;
        }
      } else {
        // The scroll reversed before the incoming portrait took over.
        baseRef.current = state.to;
        incomingRef.current = null;
        incomingProgressRef.current = 0;
        lastTransitionRef.current = null;
      }
    } else {
      baseRef.current = state.to;
    }

    const base = baseRef.current;
    const incoming = incomingRef.current;
    const time = clock.elapsedTime;

    handles.current.forEach((handle, index) => {
      if (!handle) return;

      const visible = index === base || index === incoming;
      handle.setVisible(visible);
      if (!visible) return;

      handle.setTime(time);
      handle.setProgress(index === incoming ? incomingProgressRef.current : 1);
    });
  });

  return (
    <>
      {urls.map((source, index) => (
        <Suspense key={`${index}-${source}`} fallback={null}>
          <ImageReveal
            ref={(instance) => {
              handles.current[index] = instance;
            }}
            source={source}
            renderOrder={index + 1}
          />
        </Suspense>
      ))}
    </>
  );
}

export function AboutPortraitScene({
  sources,
  mobileSources,
  revealRef,
  active,
}: AboutPortraitSceneProps) {
  return (
    <div className="about-canvas" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 100 }}
        style={{ pointerEvents: "none", background: "transparent" }}
      >
        <Suspense fallback={null}>
          <RevealScene
            sources={sources}
            mobileSources={mobileSources}
            revealRef={revealRef}
            active={active}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
