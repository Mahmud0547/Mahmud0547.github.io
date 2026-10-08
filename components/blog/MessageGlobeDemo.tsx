"use client";

import { useEffect, useState } from "react";
import { PEOPLE, SERVERS, messageTrip, telegramFor, type Place } from "@/lib/demos";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { Globe, prefersStill, type GlobeArc, type GlobeMarker } from "./Globe";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

// The trip, in seconds of animation: four flights and a pause while the bot thinks.
const LEG = 1.3, THINK = 1.1;
const SCHEDULE = [
  { leg: 0, from: 0, to: LEG },
  { leg: 1, from: LEG, to: 2 * LEG },
  { leg: -1, from: 2 * LEG, to: 2 * LEG + THINK },
  { leg: 2, from: 2 * LEG + THINK, to: 3 * LEG + THINK },
  { leg: 3, from: 3 * LEG + THINK, to: 4 * LEG + THINK },
];
const END = 4 * LEG + THINK;
const OUT = "#E0A526", BACK = "#3FD3B4";

export function MessageGlobeDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].trip;
  const [person, setPerson] = useState<Place>(PEOPLE[0]!);
  const [server, setServer] = useState<Place>(SERVERS[0]!);
  const [run, setRun] = useState(0);
  const [time, setTime] = useState<number | null>(null); // seconds into the trip, null = idle

  const dc = telegramFor(person);
  const trip = messageTrip(person, server);
  const n = (v: number, d = 0) => formatNumber(v, locale, { maximumFractionDigits: d });
  const name = (p: Place) => t.places[p.id as keyof typeof t.places];

  useEffect(() => {
    if (!run) return;
    let raf = 0;
    if (prefersStill()) {
      raf = requestAnimationFrame(() => setTime(END));
      return () => cancelAnimationFrame(raf);
    }
    const t0 = performance.now();
    const tick = () => {
      const s = Math.min(END, (performance.now() - t0) / 1000);
      setTime(s);
      if (s < END) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);

  const step = time === null ? -1 : time >= END ? SCHEDULE.length : SCHEDULE.findIndex((s) => time < s.to);
  const done = time !== null && time >= END;

  const arcs: GlobeArc[] = trip.legs.map((l, i) => {
    const s = SCHEDULE.find((x) => x.leg === i)!;
    const p = time === null ? 0 : Math.max(0, Math.min(1, (time - s.from) / (s.to - s.from)));
    const moving = time !== null && time >= s.from && time < s.to;
    return { from: l.from, to: l.to, color: i < 2 ? OUT : BACK, drawn: p, pulse: moving ? p : null };
  });
  const markers: GlobeMarker[] = [
    { place: person, label: name(person), color: OUT },
    { place: dc, label: `Telegram · ${name(dc)}`, color: "#2AABEE" },
    ...(server.id === dc.id ? [] : [{ place: server, label: fill(t.botAt, { place: name(server) }), color: BACK }]),
  ];
  const current = step >= 0 && step < SCHEDULE.length ? SCHEDULE[step]! : null;
  const focusLeg = current && current.leg >= 0 ? trip.legs[current.leg]! : current ? trip.legs[1]! : null;
  const focus = focusLeg ? { lat: (focusLeg.from.lat + focusLeg.to.lat) / 2, lon: (focusLeg.from.lon + focusLeg.to.lon) / 2 } : { lat: person.lat, lon: person.lon };

  const stepText = [
    fill(t.steps[0]!, { you: name(person), dc: name(dc) }),
    fill(t.steps[1]!, { dc: name(dc), server: name(server) }),
    t.steps[2]!,
    fill(t.steps[3]!, { server: name(server), dc: name(dc) }),
    fill(t.steps[4]!, { you: name(person) }),
  ];
  const legKm = [trip.legs[0]!.km, trip.legs[1]!.km, 0, trip.legs[2]!.km, trip.legs[3]!.km];
  const choose = (fn: () => void) => { fn(); setTime(null); };

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p className="text-soft">{t.intro}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm text-soft">{t.you}</legend>
          <div className="flex flex-wrap gap-2">
            {PEOPLE.map((p) => (
              <button key={p.id} type="button" aria-pressed={person.id === p.id} className={ui.button} onClick={() => choose(() => setPerson(p))}>{name(p)}</button>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm text-soft">{t.server}</legend>
          <div className="flex flex-wrap gap-2">
            {SERVERS.map((p) => (
              <button key={p.id} type="button" aria-pressed={server.id === p.id} className={ui.button} onClick={() => choose(() => setServer(p))}>{name(p)}</button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_40%,#132257,#050a1f_70%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,#fff8,transparent),radial-gradient(1px_1px_at_70%_20%,#fff6,transparent),radial-gradient(1.5px_1.5px_at_85%_70%,#fff7,transparent),radial-gradient(1px_1px_at_35%_80%,#fff5,transparent),radial-gradient(1px_1px_at_60%_55%,#fff4,transparent)]" />
        <div className="aspect-square w-full sm:aspect-[4/3]">
          <Globe arcs={arcs} markers={markers} focus={focus} interactive label={fill(t.globeLabel, { you: name(person), dc: name(dc), server: name(server), km: n(trip.km) })} />
        </div>
        <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-white/60">{t.drag}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={ui.primary} onClick={() => setRun((r) => r + 1)}>
          ✉️ {done ? t.again : t.send}
        </button>
      </div>

      <ol aria-live="polite" className="flex flex-col gap-2">
        {stepText.map((s, i) => {
          const state = step > i || done ? "done" : step === i ? "now" : "next";
          return (
            <li key={i} className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${state === "now" ? "bg-tint ring-2 ring-saffron" : "bg-surface"} ${state === "next" && time !== null ? "opacity-50" : ""}`}>
              <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${state === "done" ? "bg-success-soft text-success" : "bg-tint text-link"}`}>{state === "done" ? "✓" : i + 1}</span>
              <span className="flex-1">{s}</span>
              {legKm[i]! > 0 && <span className="shrink-0 text-sm tabular-nums text-soft">{fill(t.km, { km: n(Math.round(legKm[i]! / 10) * 10) })}</span>}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-2 sm:grid-cols-3">
        <p className={ui.card}><span className={ui.label}>{t.total}</span><b className="text-2xl tabular-nums">{fill(t.km, { km: n(Math.round(trip.km / 100) * 100) })}</b></p>
        <p className={ui.card}><span className={ui.label}>{t.straight}</span><b className="text-2xl tabular-nums">{fill(t.ms, { ms: n(trip.ms) })}</b></p>
        <p className={ui.card}><span className={ui.label}>{t.real}</span><b className="text-2xl tabular-nums">{fill(t.ms, { ms: n(trip.ms * 2) })}</b></p>
      </div>
      <p className="text-sm text-soft">{trip.ms * 2 < 150 ? fill(t.note, { times: n(Math.floor(300 / (trip.ms * 2))) }) : t.noteSlow}</p>
    </DemoFrame>
  );
}
