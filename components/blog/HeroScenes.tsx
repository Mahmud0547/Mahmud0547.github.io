"use client";

import { PEOPLE, SERVERS, TELEGRAM_DCS } from "@/lib/demos";
import { City3D } from "./City3D";
import { Globe, type GlobeArc } from "./Globe";

const at = (list: typeof PEOPLE, id: string) => list.find((p) => p.id === id)!;
const AMS = at(TELEGRAM_DCS, "amsterdam");

// Messages from a few cities to Telegram in Amsterdam and on to bots' servers, looping.
const ARCS: GlobeArc[] = [
  { from: at(PEOPLE, "dushanbe"), to: AMS, color: "#E0A526", drawn: 1, loop: 3.2 },
  { from: at(PEOPLE, "dubai"), to: AMS, color: "#E0A526", drawn: 1, loop: 3.6, phase: 0.4 },
  { from: at(PEOPLE, "almaty"), to: AMS, color: "#E0A526", drawn: 1, loop: 4, phase: 0.7 },
  { from: AMS, to: at(SERVERS, "singapore"), color: "#3FD3B4", drawn: 1, loop: 4.4, phase: 0.2 },
  { from: AMS, to: at(SERVERS, "virginia"), color: "#3FD3B4", drawn: 1, loop: 4.8, phase: 0.55 },
];

export function GlobeHero() {
  return (
    <div className="absolute inset-0 sm:left-[30%]">
      <Globe arcs={ARCS} markers={[{ place: AMS, color: "#2AABEE" }]} focus={{ lat: 38, lon: 38 }} label="" />
    </div>
  );
}

export function CityHero() {
  return (
    <div className="absolute inset-0">
      <City3D label="" hourLabel={(h) => `${h}:00`} />
    </div>
  );
}
