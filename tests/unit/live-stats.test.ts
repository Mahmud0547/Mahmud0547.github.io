import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLiveStats, parseStats } from "@/lib/live-stats";

const good = {
  articles: 589,
  reviewed: 12,
  published: 7,
  latest: { source: "BBC News", title: "Hello" },
  updated_at: "2026-10-01T10:44:41+00:00",
};

describe("parseStats", () => {
  it("accepts a valid payload", () => {
    expect(parseStats(good)).toEqual(good);
  });

  it("accepts a null latest", () => {
    expect(parseStats({ ...good, latest: null })?.latest).toBeNull();
  });

  it.each([
    ["a string count", { ...good, articles: "589" }],
    ["a negative count", { ...good, published: -1 }],
    ["a missing field", { ...good, reviewed: undefined }],
    ["a bad latest", { ...good, latest: { source: 1 } }],
    ["a bad date", { ...good, updated_at: "yesterday" }],
    ["not an object", "nope"],
    ["null", null],
  ])("rejects %s", (_name, raw) => {
    expect(parseStats(raw)).toBeNull();
  });

  it("drops unknown fields", () => {
    expect(parseStats({ ...good, secret: "x" })).not.toHaveProperty("secret");
  });
});

describe("fetchLiveStats", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns parsed stats on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(good), { status: 200 })));
    expect(await fetchLiveStats()).toEqual(good);
  });

  it("returns null on an HTTP error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));
    expect(await fetchLiveStats()).toBeNull();
  });

  it("returns null when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    expect(await fetchLiveStats()).toBeNull();
  });

  it("returns null when the body is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>", { status: 200 })));
    expect(await fetchLiveStats()).toBeNull();
  });
});
