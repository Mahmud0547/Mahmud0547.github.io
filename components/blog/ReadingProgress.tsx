"use client";

import { useEffect, useRef } from "react";

/** A thin bar at the top of the window that fills as the reader moves through the article. */
export function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.getElementById(target);
    if (!article || !bar.current) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = article.getBoundingClientRect();
      const total = height - window.innerHeight;
      const share = total > 0 ? Math.min(1, Math.max(0, -top / total)) : 1;
      bar.current!.style.transform = `scaleX(${share})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1" aria-hidden="true">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-saffron" />
    </div>
  );
}
