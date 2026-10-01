import snapshot from "@/content/stats-snapshot.json";

export type Stats = {
  articles: number;
  reviewed: number;
  published: number;
  latest: { source: string; title: string } | null;
  updated_at: string;
};

export function getSnapshot(): Stats {
  return snapshot;
}
