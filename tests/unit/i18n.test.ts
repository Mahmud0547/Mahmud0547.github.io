import { describe, expect, it } from "vitest";
import { format, getMessages, htmlLang, isLocale, localePath } from "@/lib/i18n";

describe("localePath", () => {
  it("keeps English at the site root", () => {
    expect(localePath("en")).toBe("/");
    expect(localePath("en", "/work/simorgh/")).toBe("/work/simorgh/");
  });

  it("prefixes other languages", () => {
    expect(localePath("ru")).toBe("/ru/");
    expect(localePath("tj", "/work/simorgh/")).toBe("/tj/work/simorgh/");
  });

  it("accepts a path without a leading slash", () => {
    expect(localePath("ru", "privacy/")).toBe("/ru/privacy/");
  });
});

describe("htmlLang", () => {
  it("uses the ISO 639-1 code for Tajik", () => {
    expect(htmlLang).toEqual({ en: "en", ru: "ru", tj: "tg" });
  });
});

describe("isLocale", () => {
  it("accepts only supported URL segments", () => {
    expect(isLocale("tj")).toBe(true);
    expect(isLocale("tg")).toBe(false);
    expect(isLocale("en-US")).toBe(false);
  });
});

describe("format", () => {
  it("replaces known placeholders", () => {
    expect(format("Updated {date}", { date: "October 1, 2026" })).toBe("Updated October 1, 2026");
    expect(format("{count} articles", { count: 558 })).toBe("558 articles");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(format("Hi {name}", {})).toBe("Hi {name}");
  });
});

describe("getMessages", () => {
  it("returns the dictionary for each language", () => {
    expect(getMessages("en").nav.work).toBe("Work");
    expect(getMessages("ru").nav.work).not.toBe("Work");
  });
});
