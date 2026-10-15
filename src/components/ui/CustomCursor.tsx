"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle custom cursor (desktop + fine pointer only). Disabled when the user
 * prefers reduced motion or on touch devices. Never blocks interaction.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduce) return;

    let rx = 0;
    let ry = 0;
    let raf = 0;

    const move = (e: MouseEvent) => {
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      }
      const tx = e.clientX;
      const ty = e.clientY;
      const animate = () => {
        rx += (tx - rx) * 0.18;
        ry += (ty - ry) * 0.18;
        if (ring.current) {
          ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
        }
        raf = requestAnimationFrame(animate);
      };
      if (!raf) raf = requestAnimationFrame(animate);
    };

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("a,button,input,textarea,select,[role=button]");
      if (ring.current) {
        ring.current.style.width = interactive ? "48px" : "34px";
        ring.current.style.height = interactive ? "48px" : "34px";
        ring.current.style.borderColor = interactive
          ? "rgba(34,211,238,0.7)"
          : "rgba(167,139,250,0.5)";
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.body.style.cursor = "";
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring hidden md:block" aria-hidden />
      <div ref={dot} className="cursor-dot hidden md:block" aria-hidden />
    </>
  );
}
