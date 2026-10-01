// Refreshes content/stats-snapshot.json from the live API before a build.
// On any failure the previous snapshot is kept, so a build never fails because the server is down.
import { readFileSync, writeFileSync } from "node:fs";

if (process.env.STATS_SNAPSHOT_FROZEN) process.exit(0);

const api = (process.env.NEXT_PUBLIC_API_URL ?? "https://9.205.154.67.sslip.io/api").replace(/\/$/, "");
const file = "content/stats-snapshot.json";
const isCount = (value) => Number.isInteger(value) && value >= 0;

try {
  const response = await fetch(`${api}/public/stats`, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const s = await response.json();
  const latestOk = s.latest === null || (typeof s.latest?.source === "string" && typeof s.latest?.title === "string");
  if (![s.articles, s.reviewed, s.published].every(isCount) || Number.isNaN(Date.parse(s.updated_at)) || !latestOk) {
    throw new Error("unexpected payload");
  }
  const latest = s.latest && { source: s.latest.source, title: s.latest.title };
  const snapshot = { articles: s.articles, reviewed: s.reviewed, published: s.published, latest, updated_at: s.updated_at };
  writeFileSync(file, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`stats snapshot updated: ${s.articles}/${s.reviewed}/${s.published}`);
} catch (error) {
  console.warn(`stats snapshot kept from ${JSON.parse(readFileSync(file, "utf8")).updated_at} (${error.message})`);
}
