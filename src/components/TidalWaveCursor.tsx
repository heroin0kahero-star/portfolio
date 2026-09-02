/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";

interface TidalWaveCursorProps {
  children: React.ReactNode;
  rippleColor?: string; // fallback customizable color hex/rgb
}

export function TidalWaveCursor({ children, rippleColor = "45, 140, 255" }: TidalWaveCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
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

    const addRipple = (x: number, y: number) => {
      ripplesRef.current.push({ x, y, radius: 2, alpha: 0.8 });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Restrict to container viewport bounds
      const parent = canvas.parentElement;
      if (parent) {
        const pRect = parent.getBoundingClientRect();
        const isInParent = (
          e.clientX >= pRect.left &&
          e.clientX <= pRect.right &&
          e.clientY >= pRect.top &&
          e.clientY <= pRect.bottom
        );
        if (!isInParent) return;
      }

      // Calculate distance from last ripple to keep them elegant and prevent overload
      const dx = x - lastMousePos.current.x;
      const dy = y - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 15) {
        addRipple(x, y);
        lastMousePos.current = { x, y };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ripplesRef.current.forEach((r) => {
        r.radius += 1.8;
        r.alpha -= 0.015;

        if (r.alpha > 0) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rippleColor}, ${r.alpha})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
      });

      ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [rippleColor]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
        style={{ mixBlendMode: "screen" }}
      />
      {children}
    </div>
  );
}
