/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  color: string;
}

export function NeoBrutalistCursor({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState({ x: -250, y: -250 });
  const [lagCoords, setLagCoords] = useState({ x: -250, y: -250 });
  const [active, setActive] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");
  const [activeColor, setActiveColor] = useState("bg-yellow-400");
  const [isClicking, setIsClicking] = useState(false);
  
  // Keep track of trailing history points to render playful sticker dots trailing the cursor
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const trailIdRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [actualMouse, setActualMouse] = useState({ x: -250, y: -250 });

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      
      if (isInside) {
        setActualMouse({ x: e.clientX, y: e.clientY });
        setActive(true);
      } else {
        setActive(false);
      }
    };

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      // Find closest interactive element
      const interactiveEl = target.closest("button, a, [role='button'], input, select, label, [data-magnetic], .cursor-pointer") as HTMLElement | null;
      if (interactiveEl) {
        setHoveredEl(interactiveEl);
        
        // Custom text mapping for specific buttons
        const innerText = (interactiveEl.innerText || "").slice(0, 15).toUpperCase().trim();
        const tagName = interactiveEl.tagName.toUpperCase();
        
        if (innerText.includes("LAUNCH") || innerText.includes("SUBMIT") || innerText.includes("REQUEST")) {
          setActiveLabel("RUN REQ! 🚀");
          setActiveColor("bg-[#F27D26]");
        } else if (innerText.includes("DESIGN") || innerText.includes("PHOTO") || innerText.includes("SHUTTER")) {
          setActiveLabel("SNAP! 📸");
          setActiveColor("bg-pink-500");
        } else if (tagName === "INPUT" || tagName === "SELECT" || interactiveEl.className.includes("btn-toggle") || tagName === "LABEL") {
          setActiveLabel("CHOOSE! ⚡");
          setActiveColor("bg-lime-400");
        } else {
          setActiveLabel("CLICK! 💥");
          setActiveColor("bg-cyan-400");
        }
      } else {
        setHoveredEl(null);
        setActiveLabel("");
        setActiveColor("bg-yellow-400");
      }
    };

    const handlePointerDown = () => setIsClicking(true);
    const handlePointerUp = () => setIsClicking(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerover", handlePointerOver);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // Frame ticker logic responsible for calculation of elastic motion and magnetic pull vectors
  useEffect(() => {
    let animId: number;
    let frameCount = 0;
    
    const ticker = () => {
      frameCount++;
      
      let targetX = actualMouse.x;
      let targetY = actualMouse.y;
      
      if (hoveredEl) {
        const rect = hoveredEl.getBoundingClientRect();
        const centerElementX = rect.left + rect.width / 2;
        const centerElementY = rect.top + rect.height / 2;
        
        // Compute interactive magnetic attraction force (pulls target 48% closer to center)
        targetX = actualMouse.x + (centerElementX - actualMouse.x) * 0.48;
        targetY = actualMouse.y + (centerElementY - actualMouse.y) * 0.48;
      }
      
      setCoords({ x: targetX, y: targetY });

      setLagCoords((prev) => {
        // Elastic smooth step interpolation towards target coordinates
        const nextX = prev.x + (targetX - prev.x) * 0.22;
        const nextY = prev.y + (targetY - prev.y) * 0.22;
        
        // Measure kinetic displacement to emit trailing particles dynamically
        const distanceMoved = Math.hypot(nextX - prev.x, nextY - prev.y);
        
        if (distanceMoved > 2 && frameCount % 3 === 0) {
          const colors = ["bg-pink-500", "bg-lime-400", "bg-cyan-400", "bg-yellow-400", "bg-purple-500"];
          const selectedColor = colors[Math.floor(Math.random() * colors.length)];
          const newId = ++trailIdRef.current;
          
          setTrail((current) => [
            ...current.slice(-12), // Max density bounds
            { x: nextX, y: nextY, id: newId, color: selectedColor }
          ]);
        }
        
        return { x: nextX, y: nextY };
      });
      
      animId = requestAnimationFrame(ticker);
    };
    animId = requestAnimationFrame(ticker);
    return () => cancelAnimationFrame(animId);
  }, [actualMouse, hoveredEl]);

  // Handle active decay to clean up trail elements periodically
  useEffect(() => {
    const decayRunner = setInterval(() => {
      setTrail((current) => current.slice(1));
    }, 150);
    return () => clearInterval(decayRunner);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full cursor-none">
      
      {/* 1. KINETIC Mover trail dots */}
      {active && trail.map((pt) => (
        <div
          key={pt.id}
          style={{
            left: `${pt.x}px`,
            top: `${pt.y}px`,
            transform: "translate(-50%, -50%)",
          }}
          className={`fixed pointer-events-none z-40 h-3 w-3 ${pt.color} border-2 border-black rounded-full shadow-[1px_1px_0px_#000] transition-transform duration-300 scale-75 opacity-70`}
        />
      ))}

      {/* 2. CORE CUSTOM NEOPLAYFUL CURSOR BADGE */}
      {active && (
        <div
          style={{
            transform: `translate3d(${lagCoords.x}px, ${lagCoords.y}px, 0) translate(-50%, -50%) ${
              isClicking ? "scale(0.85) rotate(-5deg)" : "scale(1)"
            }`,
            transition: "transform 0.08s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
          className={`fixed top-0 left-0 pointer-events-none z-50 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_#000] select-none uppercase font-mono font-black ${
            hoveredEl 
              ? `${activeColor} px-4 py-2 text-[10px] rounded-lg tracking-wide whitespace-nowrap min-w-[7rem] rotate-1` 
              : "bg-yellow-400 h-9 w-9 rounded-full"
          }`}
        >
          {hoveredEl ? (
            <span className="flex items-center gap-1.5 animate-pulse">
              {activeLabel}
            </span>
          ) : (
            <span className="text-sm select-none animate-spin-slow">★</span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
