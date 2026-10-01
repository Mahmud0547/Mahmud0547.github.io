import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import tj from "@/messages/tj.json";

function leaves(value: unknown, path = ""): [string, unknown][] {
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, `${path}[${i}]`));
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => leaves(item, path ? `${path}.${key}` : key));
  }
  return [[path, value]];
}

const placeholders = (text: unknown) => [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const english = new Map(leaves(en));

describe.each([
  ["ru", ru],
  ["tj", tj],
])("messages/%s.json", (_name, dictionary) => {
  const entries = new Map(leaves(dictionary));

  it("has exactly the same keys as English", () => {
    expect([...entries.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it("has no empty strings", () => {
    const empty = [...entries].filter(([, text]) => typeof text !== "string" || text.trim() === "");
    expect(empty).toEqual([]);
  });

  it("keeps every placeholder", () => {
    for (const [key, text] of english) {
      expect(placeholders(entries.get(key)), key).toEqual(placeholders(text));
    }
  });
});
