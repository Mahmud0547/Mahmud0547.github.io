import { describe, expect, it } from "vitest";
import { headScript, isSlowConnection, liteState, nextTheme } from "@/lib/preferences";

describe("isSlowConnection", () => {
  it("treats data saver and 2G/3G as slow", () => {
    expect(isSlowConnection({ saveData: true, effectiveType: "4g" })).toBe(true);
    expect(isSlowConnection({ effectiveType: "slow-2g" })).toBe(true);
    expect(isSlowConnection({ effectiveType: "2g" })).toBe(true);
    expect(isSlowConnection({ effectiveType: "3g" })).toBe(true);
  });

  it("treats 4G and browsers without the API as fast", () => {
    expect(isSlowConnection({ effectiveType: "4g" })).toBe(false);
    expect(isSlowConnection(undefined)).toBe(false);
  });
});

describe("liteState", () => {
  it("lets an explicit choice win over the connection", () => {
    expect(liteState("on", false)).toBe("manual");
    expect(liteState("off", true)).toBeNull();
  });

  it("switches on by itself only on a slow connection", () => {
    expect(liteState(null, true)).toBe("auto");
    expect(liteState(null, false)).toBeNull();
  });
});

describe("nextTheme", () => {
  it("cycles light → system → dark → light", () => {
    expect(nextTheme("light")).toBe("system");
    expect(nextTheme("system")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});

/** Runs the <head> script against a fake browser and returns the attributes it set on <html>. */
function runHeadScript(storage: Record<string, string>, connection?: { saveData?: boolean; effectiveType?: string }, throws = false) {
  const attributes: Record<string, string> = {};
  const document = { documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) } };
  const localStorage = {
    getItem: (key: string) => {
      if (throws) throw new Error("blocked");
      return storage[key] ?? null;
    },
  };
  new Function("document", "localStorage", "navigator", headScript())(document, localStorage, { connection });
  return attributes;
}

describe("headScript", () => {
  it("applies a saved theme and leaves 'same as the device' to CSS", () => {
    expect(runHeadScript({ theme: "dark" })).toEqual({ "data-theme": "dark" });
    expect(runHeadScript({})).toEqual({});
    expect(runHeadScript({ theme: "purple" })).toEqual({});
  });

  it("turns the light version on for slow connections unless the visitor said no", () => {
    expect(runHeadScript({}, { effectiveType: "2g" })).toEqual({ "data-lite": "auto" });
    expect(runHeadScript({ lite: "off" }, { effectiveType: "2g" })).toEqual({});
    expect(runHeadScript({ lite: "on" }, { effectiveType: "4g" })).toEqual({ "data-lite": "manual" });
    expect(runHeadScript({}, { effectiveType: "4g" })).toEqual({});
  });

  it("does not break the page when storage is blocked", () => {
    expect(() => runHeadScript({}, undefined, true)).not.toThrow();
  });
});
