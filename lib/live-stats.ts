import { config } from "./config";
import type { Stats } from "./stats";

const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;

/** Validates an API payload; anything unexpected becomes null so the UI falls back to the snapshot. */
export function parseStats(raw: unknown): Stats | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (!isCount(r.articles) || !isCount(r.reviewed) || !isCount(r.published)) return null;
  if (typeof r.updated_at !== "string" || Number.isNaN(Date.parse(r.updated_at))) return null;
  let latest: Stats["latest"] = null;
  if (r.latest !== null) {
    const l = r.latest as Record<string, unknown> | undefined;
    if (typeof l !== "object" || typeof l.source !== "string" || typeof l.title !== "string") return null;
    latest = { source: l.source, title: l.title };
  }
  return { articles: r.articles, reviewed: r.reviewed, published: r.published, latest, updated_at: r.updated_at };
}

/** Fetches public Simorgh stats; never throws, returns null on any failure. */
export async function fetchLiveStats(signal?: AbortSignal): Promise<Stats | null> {
  try {
    const timeout = AbortSignal.timeout(5000);
    const response = await fetch(`${config.apiUrl}/public/stats`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return parseStats(await response.json());
  } catch {
    return null;
  }
}
