/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import tubesCursorUrl from 'threejs-components/build/cursors/tubes1.min.js?url';

export function TubesCursor({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appInstanceRef = useRef<any>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      setActive(isInside);
    };
    window.addEventListener("pointermove", handleGlobalMove);
    return () => window.removeEventListener("pointermove", handleGlobalMove);
  }, []);

  // Fallback interactive 3D ribbon state
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: 0, targetY: 0 });
  const pointsRef = useRef<{ x: number; y: number; age: number; vx: number; vy: number }[]>([]);

  useEffect(() => {
    let unmounted = false;

    // Attempt to load the requested Threejs Awwwards cursor component
    const initTimer = setTimeout(() => {
      if (unmounted) return;
      
      import(/* @vite-ignore */ tubesCursorUrl)
        .then((module) => {
          if (unmounted || !canvasRef.current) return;
          const TubesCursorInitializer = module.default;

          try {
            const app = TubesCursorInitializer(canvasRef.current, {
              tubes: {
                colors: ["#5e72e4", "#8965e0", "#f5365c"],
                lights: {
                  intensity: 200,
                  colors: ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"]
                }
              }
            });
            appInstanceRef.current = app;
          } catch (e) {
            if (import.meta.env.DEV) console.warn("Unable to construct WebGL Tubes cursor. Activating high-fidelity 3D ribbon physics fallback.");
            setUsingFallback(true);
          }
        })
        .catch((err) => {
          if (import.meta.env.DEV) console.warn("Failed to load ThreeJS Tubes module. Initializing local 3D ribbon context.", err);
          setUsingFallback(true);
        });
    }, 120);

    return () => {
      unmounted = true;
      clearTimeout(initTimer);
      if (appInstanceRef.current && typeof appInstanceRef.current.dispose === 'function') {
        try {
          appInstanceRef.current.dispose();
        } catch (e) {}
      }
    };
  }, []);

  // Set up fallback canvas loop if needed
  useEffect(() => {
    if (!usingFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      if (mouseRef.current.x === -1000) {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    let animationId: number;
    let t = 0;

    const colors = ["#21d4fd", "#b721ff", "#f5365c", "#11cdef"];

    const updateAndRender = () => {
      t += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp mouse positions
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.12;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.12;

      // Add points inside mouse trail
      if (Math.abs(mouseRef.current.x - mouseRef.current.targetX) > 0.5 || Math.random() > 0.3) {
        pointsRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          age: 0,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
        });
      }

      // Constrain point count
      if (pointsRef.current.length > 50) {
        pointsRef.current.shift();
      }

      // Draw multi-layered ribbon structure (Aesthetic 3D flow)
      const pts = pointsRef.current;
      for (let layer = 0; layer < 3; layer++) {
        if (pts.length < 3) break;
        ctx.beginPath();
        const offsetMultiplier = (layer - 1) * 12;

        ctx.moveTo(
          pts[0].x + Math.sin(t + 0) * offsetMultiplier,
          pts[0].y + Math.cos(t + 0) * offsetMultiplier
        );

        for (let i = 1; i < pts.length; i++) {
          const pt = pts[i];
          pt.age += 1;
          pt.x += pt.vx;
          pt.y += pt.vy;

          const xc = (pt.x + pts[i - 1].x) / 2;
          const yc = (pt.y + pts[i - 1].y) / 2;
          ctx.quadraticCurveTo(
            pts[i - 1].x + Math.sin(t + i) * offsetMultiplier,
            pts[i - 1].y + Math.cos(t + i) * offsetMultiplier,
            xc + Math.sin(t + i + 0.5) * offsetMultiplier,
            yc + Math.cos(t + i + 0.5) * offsetMultiplier
          );
        }

        ctx.strokeStyle = colors[layer % colors.length];
        ctx.shadowColor = colors[layer % colors.length];
        ctx.shadowBlur = 10;
        ctx.lineWidth = Math.max(1, 4 - layer);
        ctx.stroke();
      }

      // Reset shadows
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(updateAndRender);
    };

    updateAndRender();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [usingFallback]);

  const handleContainerClick = () => {
    if (appInstanceRef.current) {
      const tubesColors = ["#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')];
      const lightColors = ["#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')];
      
      try {
        if (appInstanceRef.current.tubes) {
          appInstanceRef.current.tubes.setColors(tubesColors);
          appInstanceRef.current.tubes.setLightsColors(lightColors);
        }
      } catch (e) {}
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full h-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        style={{ opacity: active ? 1 : 0, transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
        className="fixed inset-0 w-full h-full pointer-events-none z-40"
      />
      {children}
    </div>
  );
}
