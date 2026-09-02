/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from "react";
import { FadingVideoProps } from "../types";

export function FadingVideo({ src, className = "", style = {} }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const FADE_MS = 500;
  const FADE_OUT_LEAD = 0.55; // 0.55 seconds lead time for fade-out

  const fadeTo = (targetOpacity: number, duration: number = FADE_MS) => {
    const video = videoRef.current;
    if (!video) return;

    // Read current opacity from inline style
    const currentOpacityStr = video.style.opacity || "0";
    const startOpacity = parseFloat(currentOpacityStr);
    const opacityDiff = targetOpacity - startOpacity;
    const startTime = performance.now();

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate and apply interpolating opacity
      const currentOpacity = startOpacity + opacityDiff * progress;
      video.style.opacity = currentOpacity.toFixed(4);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initially opacity is 0
    video.style.opacity = "0";

    const handleLoadedData = () => {
      video.style.opacity = "0";
      fadingOutRef.current = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            fadeTo(1, FADE_MS);
          })
          .catch((err) => {
            if (import.meta.env.DEV) console.warn("Autoplay blocked or video error:", err);
          });
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        const remainingTime = video.duration - video.currentTime;
        if (!fadingOutRef.current && remainingTime <= FADE_OUT_LEAD && remainingTime > 0) {
          fadingOutRef.current = true;
          fadeTo(0, FADE_MS);
        }
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              fadingOutRef.current = false;
              fadeTo(1, FADE_MS);
            })
            .catch((err) => { if (import.meta.env.DEV) console.warn("Reset play failed:", err); });
        }
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // If source changes, trigger load
    video.load();

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{
        ...style,
        willChange: "opacity",
        pointerEvents: "none"
      }}
      muted
      playsInline
      preload="auto"
    />
  );
}
