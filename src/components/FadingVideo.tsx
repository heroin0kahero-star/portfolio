/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from "react";
import { FadingVideoProps } from "../types";

interface FadingVideoPropsExtended extends FadingVideoProps {
  poster?: string;
}

export function FadingVideo({
  src,
  className = "",
  style = {},
  poster,
}: FadingVideoPropsExtended) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const FADE_MS = 500;

  const fadeTo = (video: HTMLVideoElement, targetOpacity: number, duration: number = FADE_MS) => {
    if (!video) return;

    // Read current opacity from inline style
    const currentOpacityStr = video.style.opacity || "0";
    const startOpacity = parseFloat(currentOpacityStr);
    const opacityDiff = targetOpacity - startOpacity;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate and apply interpolating opacity
      const currentOpacity = startOpacity + opacityDiff * progress;
      video.style.opacity = currentOpacity.toFixed(4);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = "0";
    video.load();

    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video started playing - fade in
          fadeTo(video, 1, FADE_MS);
        })
        .catch((err) => {
          // Autoplay blocked - set up user interaction to resume
          const resumeAfterInteraction = () => {
            video.play()
              .then(() => fadeTo(video, 1, FADE_MS))
              .catch((e) => console.warn("Video play failed after interaction:", e));
            document.removeEventListener("click", resumeAfterInteraction);
            document.removeEventListener("keydown", resumeAfterInteraction);
            document.removeEventListener("mousedown", resumeAfterInteraction);
          };
          document.addEventListener("click", resumeAfterInteraction);
          document.addEventListener("keydown", resumeAfterInteraction);
          document.addEventListener("mousedown", resumeAfterInteraction);
        });
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        const remainingTime = video.duration - video.currentTime;
        if (remainingTime <= 0.55 && remainingTime > 0) {
          fadeTo(video, 0, FADE_MS);
        }
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => fadeTo(video, 1, FADE_MS))
          .catch((err) => console.warn("Reset play failed:", err));
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleError = () => {
    const video = videoRef.current;
    const mediaError = video?.error;
    // Keep the element (and the gradient behind it) in place; only report.
    console.warn(
      `[FadingVideo] Failed to load video: ${src}`,
      mediaError
        ? `code=${mediaError.code} message=${mediaError.message}`
        : "no MediaError details"
    );
  };

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{
        ...style,
        willChange: "opacity",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      muted
      playsInline
      preload="auto"
      poster={poster}
      onError={handleError}
    />
  );
}