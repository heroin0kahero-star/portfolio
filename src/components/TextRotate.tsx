/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Text Rotate — built from scratch (21st.dev text-rotate reference)
 * Rotates through an array of words/phrases with framer-motion.
 * Respects prefers-reduced-motion.
 */

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface TextRotateProps {
  words: string[];
  prefix?: string;
  className?: string;
  duration?: number;
}

export function TextRotate({
  words,
  prefix = "I build websites for",
  className = "",
  duration = 3,
}: TextRotateProps) {
  const [index, setIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || words.length <= 1) {
      setIsEntering(true);
      return;
    }

    const timer = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
      }, 400);
      setTimeout(() => {
        setIsExiting(false);
        setIsEntering(true);
      }, 600);
    }, duration * 1000);

    return () => clearInterval(timer);
  }, [words, duration]);

  const current = words[index];

  return (
    <div className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-montserrat font-extrabold text-neutral-400 tracking-widest uppercase">
        {prefix}
      </span>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" },
        }}
        exit={{
          opacity: 0,
          y: -10,
          transition: { duration: 0.3, ease: "easeIn" },
        }}
        className="font-montserrat font-extrabold text-white tracking-widest uppercase"
      >
        {current}
      </motion.span>
    </div>
  );
}
