/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";

export function CustomBrutalistCursor({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (isInside) {
        setCoords({ x: e.clientX, y: e.clientY });
        setActive(true);
      } else {
        setActive(false);
      }
    };

    const onMouseLeave = () => setActive(false);
    const onMouseEnter = () => setActive(true);

    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full cursor-none">
      {/* Heavy-outline solid pixel offset cursor block */}
      {active && (
        <div
          style={{
            transform: `translate3d(${coords.x}px, ${coords.y}px, 0) translate(-50%, -50%)`,
            mixBlendMode: "difference"
          }}
          className="fixed top-0 left-0 h-10 w-10 border-4 border-white bg-white text-[8px] font-mono text-black font-semibold flex flex-col items-center justify-center pointer-events-none z-50 shadow-[4px_4px_0px_#000] select-none"
        >
          <span>PXL</span>
          <span className="text-[6px] tracking-tight">{coords.x},{coords.y}</span>
        </div>
      )}
      {children}
    </div>
  );
}
