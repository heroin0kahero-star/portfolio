/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useCallback } from "react";

interface ProjectVideoProps {
  src: string;
  ariaLabel: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable project preview video.
 * - autoPlay, muted, loop, playsInline, preload="metadata" (mobile-safe autoplay)
 * - No native controls, no poster
 * - Plays only when in viewport (IntersectionObserver), pauses when off-screen
 * - Keeps parent-applied sizing / border-radius / hover effects via className
 * - object-fit: cover so layout doesn't shift vs the old image
 */
export function ProjectVideo({
  src,
  ariaLabel,
  className = "",
  style = {},
}: ProjectVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const video = videoRef.current;
      if (!video) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (import.meta.env.DEV) {
                console.warn("ProjectVideo autoplay blocked:", err);
              }
            });
          }
        } else {
          video.pause();
        }
      });
    },
    []
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });
    observer.observe(video);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [handleIntersection]);

  return (
    <video
      ref={videoRef}
      src={src}
      aria-label={ariaLabel}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
      style={{ ...style, objectFit: "cover", display: "block" }}
    />
  );
}
