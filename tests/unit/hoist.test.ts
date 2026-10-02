import { describe, expect, it } from "vitest";
import { headScript } from "@/lib/preferences";
import { hoist } from "../../scripts/hoist-head-script.mjs";

const page = (head: string) => `<!DOCTYPE html><html><head><meta charSet="utf-8"/>${head}</head><body></body></html>`;

describe("hoist", () => {
  const script = `<script>${headScript()}</script>`;

  it("moves the preferences script before the stylesheet", () => {
    const html = page(`<link rel="stylesheet" href="/a.css"/><meta name="x"/>${script}`);
    const out = hoist(html);
    expect(out.indexOf(script)).toBeLessThan(out.indexOf('rel="stylesheet"'));
    expect(out.indexOf(script)).toBe(out.indexOf('<meta charSet="utf-8"/>') + '<meta charSet="utf-8"/>'.length);
    expect(out.length).toBe(html.length);
  });

  it("leaves pages without the script alone", () => {
    const html = page('<link rel="stylesheet" href="/a.css"/>');
    expect(hoist(html)).toBe(html);
  });

  it("recognises the real script, so a change to it cannot silently stop the move", () => {
    expect(hoist(page(`<link rel="stylesheet"/>${script}`))).not.toBe(page(`<link rel="stylesheet"/>${script}`));
  });
});
