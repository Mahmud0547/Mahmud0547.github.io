"use client";

import { useEffect, useRef } from "react";
import { DELAY_BY_HOUR } from "@/lib/demos";
import { prefersStill } from "./Globe";

/**
 * Article 3's data as a little 3D city, drawn on a canvas without a 3D library: one column per hour of the day
 * (left to right) and delay range (front to back), as tall as the number of articles. Drag to turn it.
 */

export const BUCKET_COLORS = ["#3FD3B4", "#2BA8A0", "#6E8BFF", "#E0A526", "#F07A4A"];
const ROWS = DELAY_BY_HOUR.length, COLS = DELAY_BY_HOUR[0]!.length;
const MAX = Math.max(...DELAY_BY_HOUR.flat());
const GAP = 1.5; // spacing between delay rows
const HEIGHT = 7; // world height of the tallest column

export interface CityHover {
  hour: number;
  bucket: number;
  count: number;
  x: number;
  y: number;
}

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

export function City3D({ highlight = null, interactive = false, label, hourLabel, onHover }: {
  highlight?: number | null;
  interactive?: boolean;
  label: string;
  hourLabel: (h: number) => string;
  onHover?: (h: CityHover | null) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ highlight, onHover, hourLabel });
  const view = useRef({ yaw: -0.55, pitch: 0.62, drag: null as null | { x: number; y: number; yaw: number; pitch: number }, hit: [] as { poly: number[][]; h: number; b: number }[] });

  useEffect(() => {
    live.current = { highlight, onHover, hourLabel };
  });

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const still = prefersStill();
    const born = performance.now();
    let raf = 0, last = born;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const draw = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const v = view.current, { highlight: hi } = live.current;
      if (!v.drag && !interactive && !still) v.yaw += dt * 0.00012;
      const W = el.width, H = el.height;
      const cy0 = (ROWS - 1) / 2, cz0 = ((COLS - 1) * GAP) / 2;
      const cosY = Math.cos(v.yaw), sinY = Math.sin(v.yaw), cosP = Math.cos(v.pitch), sinP = Math.sin(v.pitch);
      const s = Math.min(W / 27, H / 17);
      const cx = W / 2, cy = H * 0.6;
      // world (x along hours, y up, z along delay rows) → screen
      const P = (x: number, y: number, z: number) => {
        const X = x - cy0, Z = z - cz0;
        const xr = X * cosY - Z * sinY, zr = X * sinY + Z * cosY;
        return [cx + xr * s, cy - (y * cosP + zr * sinP) * s, zr] as const;
      };
      const grow = still ? 1 : Math.min(1, (now - born) / 1400);

      ctx.clearRect(0, 0, W, H);
      // floor grid
      ctx.strokeStyle = "rgba(160,190,255,0.14)";
      ctx.lineWidth = Math.max(1, s / 40);
      for (let h = 0; h <= ROWS; h += 3) {
        const a = P(h - 0.5, 0, -0.8), b = P(h - 0.5, 0, (COLS - 1) * GAP + 0.8);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      for (let b = 0; b < COLS; b++) {
        const a = P(-0.8, 0, b * GAP), c = P(ROWS - 0.2, 0, b * GAP);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
      }

      // columns, far ones first
      const boxes: { h: number; b: number; depth: number }[] = [];
      for (let h = 0; h < ROWS; h++) for (let b = 0; b < COLS; b++) boxes.push({ h, b, depth: P(h, 0, b * GAP)[2] });
      boxes.sort((a, c) => c.depth - a.depth);
      const hit: typeof v.hit = [];
      const w = 0.36;
      // side faces as (dx, dz) pairs of their corners and their outward normal
      const sides: [number, number, number, number, number, number][] = [
        [-w, -w, w, -w, 0, -1], [w, -w, w, w, 1, 0], [w, w, -w, w, 0, 1], [-w, w, -w, -w, -1, 0],
      ];
      for (const { h, b } of boxes) {
        const count = DELAY_BY_HOUR[h]![b]!;
        const local = Math.max(0, Math.min(1, grow * 1.6 - h / 40));
        const ease = 1 - (1 - local) ** 3;
        const top = Math.max(0.05, (count / MAX) * HEIGHT * ease);
        const x = h, z = b * GAP;
        const dim = hi !== null && hi !== b;
        const base = BUCKET_COLORS[b]!;
        ctx.globalAlpha = dim ? 0.16 : 1;
        for (const [ax, az, bx, bz, nx, nz] of sides) {
          // a face is visible when its normal points towards the camera (negative rotated z)
          const nzr = nx * sinY + nz * cosY;
          if (nzr >= 0) continue;
          const pts = [P(x + ax, 0, z + az), P(x + bx, 0, z + bz), P(x + bx, top, z + bz), P(x + ax, top, z + az)];
          ctx.fillStyle = shade(base, nx !== 0 ? 0.62 : 0.78);
          ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.closePath();
          ctx.fill();
          hit.push({ poly: pts.map((p) => [p[0], p[1]]), h, b });
        }
        const tp = [P(x - w, top, z - w), P(x + w, top, z - w), P(x + w, top, z + w), P(x - w, top, z + w)];
        ctx.fillStyle = shade(base, 1.12);
        ctx.beginPath();
        tp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
        ctx.fill();
        hit.push({ poly: tp.map((p) => [p[0], p[1]]), h, b });
        ctx.globalAlpha = 1;
      }
      v.hit = hit;

      // hour labels along the front edge
      ctx.fillStyle = "rgba(220,230,255,0.75)";
      ctx.font = `600 ${Math.max(10, Math.round(s * 0.55))}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      for (let h = 0; h < ROWS; h += 3) {
        const p = P(h, 0, -1.6);
        ctx.fillText(live.current.hourLabel(h), p[0], p[1] + s * 0.3);
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e!.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [interactive]);

  const inside = (x: number, y: number, poly: number[][]) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i]!, [xj, yj] = poly[j]!;
      if (yi! > y !== yj! > y && x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!) c = !c;
    }
    return c;
  };
  const probe = (e: React.PointerEvent) => {
    const el = canvas.current!, box = el.getBoundingClientRect();
    const k = el.width / box.width;
    const x = (e.clientX - box.left) * k, y = (e.clientY - box.top) * k;
    const hit = [...view.current.hit].reverse().find((f) => inside(x, y, f.poly));
    live.current.onHover?.(hit ? { hour: hit.h, bucket: hit.b, count: DELAY_BY_HOUR[hit.h]![hit.b]!, x: e.clientX - box.left, y: e.clientY - box.top } : null);
  };
  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    view.current.drag = { x: e.clientX, y: e.clientY, yaw: view.current.yaw, pitch: view.current.pitch };
    probe(e);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const d = view.current.drag;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
      view.current.yaw = d.yaw + (e.clientX - d.x) * 0.008;
      view.current.pitch = Math.max(0.25, Math.min(1.1, d.pitch + (e.clientY - d.y) * 0.004));
      live.current.onHover?.(null);
    } else if (!d) probe(e);
  };
  const onUp = () => (view.current.drag = null);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label}
      className={`block h-full w-full ${interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => live.current.onHover?.(null)}
    />
  );
}
