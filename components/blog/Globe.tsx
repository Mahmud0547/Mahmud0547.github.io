"use client";

import { useEffect, useRef } from "react";
import { makeLandTest, type Place } from "@/lib/demos";
import { LAND } from "@/lib/land-mask";

/**
 * A small 3D globe drawn on a canvas, no 3D library: land is a cloud of dots (Natural Earth mask), routes are
 * great-circle arcs that rise above the surface, and a glowing dot can travel along them. Drag to turn it.
 * Used by lesson 7's hero (decorative) and its demo (interactive).
 */

export interface GlobeArc {
  from: Place;
  to: Place;
  color: string;
  /** 0..1 — how much of the arc is drawn. */
  drawn: number;
  /** 0..1 — where the travelling light is, or null. */
  pulse?: number | null;
  /** Seconds per trip for a light that keeps travelling the arc (decorative); `phase` offsets it. */
  loop?: number;
  phase?: number;
}
export interface GlobeMarker {
  place: Place;
  label?: string;
  color: string;
}
export interface GlobeProps {
  arcs?: GlobeArc[];
  markers?: GlobeMarker[];
  /** Turn smoothly to face this point; without it the globe spins slowly. */
  focus?: { lat: number; lon: number } | null;
  interactive?: boolean;
  label: string;
  className?: string;
}

const RAD = Math.PI / 180;
type V = [number, number, number];

const vec = (lat: number, lon: number): V => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];

/** Land dots on a Fibonacci sphere, computed once per page. */
let landDots: V[] | null = null;
function dots(): V[] {
  if (landDots) return landDots;
  const isLand = makeLandTest(LAND);
  const out: V[] = [];
  const n = 5200, golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    const lat = Math.asin(y) / RAD, lon = Math.atan2(Math.cos(th) * r, Math.sin(th) * r) / RAD;
    if (isLand(lat, lon)) out.push(vec(lat, lon));
  }
  return (landDots = out);
}

/** Point on the arc a→b at t, lifted above the surface in the middle. */
function arcPoint(a: V, b: V, t: number): V {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  if (om < 1e-6) return a;
  const s = Math.sin(om), k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
  const lift = 1 + Math.sin(Math.PI * t) * Math.min(0.32, om * 0.22);
  return [(a[0] * k1 + b[0] * k2) * lift, (a[1] * k1 + b[1] * k2) * lift, (a[2] * k1 + b[2] * k2) * lift];
}

export const prefersStill = () =>
  typeof window !== "undefined" && (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-lite"));

export function Globe({ arcs = [], markers = [], focus = null, interactive = false, label, className = "" }: GlobeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const props = useRef({ arcs, markers, focus });
  const view = useRef({ lon: 40, lat: 22, drag: null as null | { x: number; y: number; lon: number; lat: number } });

  useEffect(() => {
    props.current = { arcs, markers, focus };
  });

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const still = prefersStill();
    const land = dots();
    let raf = 0, last = performance.now();

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
      const v = view.current, p = props.current;
      // camera: ease to focus, else slow spin
      if (!v.drag) {
        if (p.focus) {
          const dLon = ((p.focus.lon - v.lon + 540) % 360) - 180;
          const k = still ? 1 : 1 - Math.exp(-dt / 420);
          v.lon += dLon * k;
          v.lat += (Math.max(-50, Math.min(50, p.focus.lat * 0.8)) - v.lat) * k;
        } else if (!still) {
          v.lon -= dt * 0.006;
        }
      }
      const W = el.width, H = el.height, R = Math.min(W, H) * 0.42, cx = W / 2, cy = H / 2;
      const cl = Math.cos(-v.lon * RAD), sl = Math.sin(-v.lon * RAD), cp = Math.cos(v.lat * RAD), spn = Math.sin(v.lat * RAD);
      const rot = (q: V): V => {
        const x = q[0] * cl + q[2] * sl, z = -q[0] * sl + q[2] * cl;
        return [x, q[1] * cp - z * spn, q[1] * spn + z * cp];
      };
      const scr = (q: V) => [cx + q[0] * R, cy - q[1] * R] as const;
      const seen = (q: V) => q[2] > 0 || q[0] * q[0] + q[1] * q[1] > 1;

      ctx.clearRect(0, 0, W, H);
      // atmosphere and sphere
      const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
      glow.addColorStop(0, "rgba(63,211,180,0.22)");
      glow.addColorStop(1, "rgba(63,211,180,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "#1d2d6b");
      body.addColorStop(1, "#070d26");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // land dots, brighter towards the viewer
      const ds = Math.max(1.2, R / 210);
      for (const d of land) {
        const q = rot(d);
        if (q[2] <= 0) continue;
        const [x, y] = scr(q);
        ctx.fillStyle = `rgba(159,226,214,${0.25 + 0.7 * q[2]})`;
        ctx.fillRect(x - ds / 2, y - ds / 2, ds, ds);
      }
      // rim light
      ctx.strokeStyle = "rgba(160,190,255,0.35)";
      ctx.lineWidth = Math.max(1, R / 160);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // arcs
      const lw = Math.max(1.5, R / 110);
      for (const arc of p.arcs) {
        const a = arc.loop && !still ? { ...arc, pulse: (now / 1000 / arc.loop + (arc.phase ?? 0)) % 1 } : arc;
        const A = vec(a.from.lat, a.from.lon), B = vec(a.to.lat, a.to.lon);
        const steps = 64, until = Math.round(steps * a.drawn);
        ctx.strokeStyle = a.color;
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.9;
        let pen = false;
        ctx.beginPath();
        for (let i = 0; i <= until; i++) {
          const q = rot(arcPoint(A, B, i / steps));
          const [x, y] = scr(q);
          if (seen(q)) { if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; } else pen = false;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (a.pulse != null) {
          for (let k = 8; k >= 0; k--) {
            const q = rot(arcPoint(A, B, Math.max(0, a.pulse - k * 0.012)));
            if (!seen(q)) continue;
            const [x, y] = scr(q);
            ctx.fillStyle = k === 0 ? "#ffffff" : a.color;
            ctx.globalAlpha = k === 0 ? 1 : 0.5 * (1 - k / 9);
            ctx.beginPath();
            ctx.arc(x, y, lw * (k === 0 ? 2.2 : 1.6), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          const q = rot(arcPoint(A, B, a.pulse));
          if (seen(q)) {
            const [x, y] = scr(q);
            const g = ctx.createRadialGradient(x, y, 0, x, y, lw * 9);
            g.addColorStop(0, "rgba(255,255,255,0.55)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(x - lw * 9, y - lw * 9, lw * 18, lw * 18);
          }
        }
      }

      // markers with labels
      ctx.font = `600 ${Math.max(11, Math.round(R / 15))}px system-ui, sans-serif`;
      for (const m of p.markers) {
        const q = rot(vec(m.place.lat, m.place.lon));
        if (q[2] <= 0.05) continue;
        const [x, y] = scr(q);
        const r = Math.max(3, R / 55);
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = Math.max(1, r / 3);
        ctx.stroke();
        if (m.label) {
          ctx.fillStyle = "rgba(5,10,30,0.7)";
          const w = ctx.measureText(m.label).width;
          ctx.fillRect(x + r * 1.8 - 4, y - r * 3.2, w + 8, r * 2.6 + 6);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(m.label, x + r * 1.8, y - r * 1.1);
        }
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    // Draw only while the globe is on screen.
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
  }, []);

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    view.current.drag = { x: e.clientX, y: e.clientY, lon: view.current.lon, lat: view.current.lat };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = view.current.drag;
    if (!d) return;
    const k = 180 / (canvas.current!.clientWidth || 300);
    view.current.lon = d.lon - (e.clientX - d.x) * k;
    view.current.lat = Math.max(-60, Math.min(60, d.lat + (e.clientY - d.y) * k));
  };
  const onUp = () => (view.current.drag = null);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label}
      className={`block h-full w-full ${interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${className}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    />
  );
}
