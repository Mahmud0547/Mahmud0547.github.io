import { describe, expect, it } from "vitest";
import { formatCount, formatDate, formatPrice } from "@/lib/format";

const spaces = (text: string) => text.replace(/[  ]/g, " ");

describe("formatCount", () => {
  it("groups thousands by language", () => {
    expect(formatCount(1558, "en")).toBe("1,558");
    expect(spaces(formatCount(1558, "ru"))).toBe("1 558");
    expect(formatCount(7, "tj")).toBe("7");
  });
});

describe("formatDate", () => {
  it("formats a long date in Dushanbe time", () => {
    expect(formatDate("2026-10-01T09:00:00Z", "en")).toBe("October 1, 2026");
    expect(spaces(formatDate("2026-10-01T09:00:00Z", "ru"))).toBe("1 октября 2026 г.");
    expect(formatDate("2026-10-01T09:00:00Z", "tj")).toContain("2026");
  });

  it("uses the Dushanbe calendar day, not UTC", () => {
    expect(formatDate("2026-09-30T20:00:00Z", "en")).toBe("October 1, 2026");
  });
});

describe("formatPrice", () => {
  it("shows whole US dollars", () => {
    expect(formatPrice(50, "en")).toBe("$50");
    expect(spaces(formatPrice(140, "ru"))).toBe("140 $");
  });
});
