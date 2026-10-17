/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface BlurTextProps {
  text: string;
  className?: string;
  delayOffset?: number; // extra base delay if needed
}

export function BlurText({ text, className = "", delayOffset = 0 }: BlurTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.1) {
          setIsVisible(true);
          // Unobserve once triggered to lock animation in state
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const words = text.split(" ");

  return (
    <div
      ref={containerRef}
      className={`flex flex-wrap justify-center items-center select-none ${className}`}
      style={{ rowGap: "0.1em" }}
    >
      {words.map((word, i) => {
        const delay = delayOffset + i * 0.1; // (i * 100) / 1000 seconds

        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
            animate={
              isVisible
                ? {
                    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                    opacity: [0, 0.5, 1],
                    y: [50, -5, 0],
                  }
                : { filter: "blur(10px)", opacity: 0, y: 50 }
            }
            transition={{
              duration: 0.7,
              times: [0, 0.5, 1],
              ease: "easeOut",
              delay: delay,
            }}
            style={{
              display: "inline-block",
              marginRight: "0.28em",
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
