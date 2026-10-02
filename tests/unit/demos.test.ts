import { describe, expect, it } from "vitest";
import { cyrillicCheck, homePage, loadSeconds, matchRule, parseAmount, partsFor, pythonCode, routineCost, runChain, toSomoni, tryAccess } from "@/lib/demos";

describe("matchRule", () => {
  const rules = [
    { when: "price", reply: "From $50" },
    { when: "Hours", reply: "9 to 6" },
  ];
  it("finds the first rule whose keyword is in the message, ignoring case", () => {
    expect(matchRule(rules, "What is the PRICE?")).toBe(0);
    expect(matchRule(rules, "your hours please")).toBe(1);
  });
  it("returns -1 when nothing matches and ignores empty keywords", () => {
    expect(matchRule(rules, "hello")).toBe(-1);
    expect(matchRule([{ when: "  ", reply: "x" }], "anything")).toBe(-1);
  });
});

describe("pythonCode", () => {
  it("writes if/elif/else in rule order with quoted strings", () => {
    const code = pythonCode([{ when: "Price", reply: 'Say "hi"' }, { when: "hours", reply: "9-6" }], "Sorry");
    expect(code).toContain('if "price" in text:');
    expect(code).toContain('await message.answer("Say \\"hi\\"")');
    expect(code).toContain('elif "hours" in text:');
    expect(code).toContain("    else:\n        await message.answer(\"Sorry\")");
  });
  it("answers with the fallback only when there are no rules", () => {
    expect(pythonCode([], "Hi")).not.toContain("else");
  });
});

describe("parseAmount", () => {
  it("reads number and currency", () => {
    expect(parseAmount("  100 USD ")).toEqual({ cleaned: "100 usd", amount: 100, currency: "USD" });
    expect(parseAmount("12,5 евро").amount).toBe(12.5);
    expect(parseAmount("12,5 евро").currency).toBe("EUR");
    expect(parseAmount("1 000 сомони")).toMatchObject({ amount: 1000, currency: "TJS" });
  });
  it("reports what is missing", () => {
    expect(parseAmount("dollars please")).toMatchObject({ amount: null, currency: "USD" });
    expect(parseAmount("500")).toMatchObject({ amount: 500, currency: null });
  });
});

describe("cyrillicCheck", () => {
  it("passes a Russian post and fails English reasoning, like the newsroom", () => {
    expect(cyrillicCheck("Министры договорились о новых правилах.").pass).toBe(true);
    expect(cyrillicCheck("Okay, the user wants a post. Let me think…").pass).toBe(false);
  });
  it("needs more than half, and some letters at all", () => {
    expect(cyrillicCheck("ab вг").pass).toBe(false);
    expect(cyrillicCheck("123 !!").pass).toBe(false);
  });
  it("does not count Tajik-only letters as Russian", () => {
    expect(cyrillicCheck("ҳҷқ").cyrillic).toBe(0);
  });
});

describe("runChain", () => {
  it("skips busy and English-answering models and stops at the first that works", () => {
    const result = runChain([
      { name: "A", state: "busy" },
      { name: "B", state: "english" },
      { name: "C", state: "ok" },
      { name: "D", state: "ok" },
    ]);
    expect(result.writer).toBe("C");
    expect(result.steps.map((s) => s.model)).toEqual(["A", "B", "C"]);
  });
  it("reports no writer when every model fails", () => {
    expect(runChain([{ name: "A", state: "busy" }]).writer).toBeNull();
  });
});

describe("toSomoni", () => {
  it("divides by the nominal the bank publishes", () => {
    expect(toSomoni(1000, 0.2089, 10)).toBeCloseTo(20.89);
    expect(toSomoni(100, 9.2331, 1)).toBeCloseTo(923.31);
  });
});

describe("tryAccess", () => {
  it("allows what the role may do, however it asks", () => {
    expect(tryAccess("editor", "writePost", "app", "api")).toBe("allowed");
    expect(tryAccess("visitor", "readPublic", "database", "app")).toBe("allowed");
  });
  it("only hides the button in the app", () => {
    expect(tryAccess("member", "readInbox", "app", "app")).toBe("hidden");
  });
  it("leaks on a direct request when rules live only in the app, and refuses when they live in the database", () => {
    expect(tryAccess("visitor", "readMembers", "app", "api")).toBe("leaked");
    expect(tryAccess("visitor", "readMembers", "database", "api")).toBe("refused");
  });
  it("never lets anyone make themselves admin", () => {
    expect(tryAccess("admin", "makeAdmin", "database", "api")).toBe("refused");
  });
});

describe("lesson 5: slow internet", () => {
  it("downloads everything in the full version and skips photos in the light one", () => {
    expect(partsFor(homePage, false).map((p) => p.id)).toEqual(["html", "css", "fonts", "js", "photos"]);
    expect(partsFor(homePage, true).map((p) => p.id)).toEqual(["html", "css", "fonts", "js"]);
  });

  it("estimates load time from size, speed and round trips", () => {
    // 613 KB over 700 kbit/s plus three round trips of 270 ms.
    expect(loadSeconds(homePage, "3g", false)).toBeCloseTo((613 * 8) / 700 + 0.81, 5);
    // The light version skips the photo wave: 271 KB and two round trips.
    expect(loadSeconds(homePage, "3g", true)).toBeCloseTo((271 * 8) / 700 + 0.54, 5);
  });

  it("the light version is always faster, and slower networks are always slower", () => {
    for (const net of ["4g", "3g", "2g"] as const) {
      expect(loadSeconds(homePage, net, true)).toBeLessThan(loadSeconds(homePage, net, false));
    }
    expect(loadSeconds(homePage, "4g", false)).toBeLessThan(loadSeconds(homePage, "3g", false));
    expect(loadSeconds(homePage, "3g", false)).toBeLessThan(loadSeconds(homePage, "2g", false));
  });

  it("matches the real build closely enough to quote in the lesson", () => {
    expect(homePage.reduce((sum, p) => sum + p.kb, 0)).toBe(613);
  });
});

describe("routine calculator", () => {
  it("counts hours and money per month", () => {
    // 40 questions a day × 3 minutes, 22 working days = 44 hours; checking 1 minute each leaves 14.67.
    const r = routineCost({ perDay: 40, minutes: 3, checkMinutes: 1, hourlyRate: 10 }, 140);
    expect(r.hoursBefore).toBeCloseTo(44);
    expect(r.hoursAfter).toBeCloseTo(14.667, 2);
    expect(r.moneySaved).toBeCloseTo(293.33, 1);
    // $293.33 / 22 days = $13.33 a day → $140 back in 10.5 days.
    expect(r.paybackDays).toBeCloseTo(10.5, 1);
  });

  it("never claims savings when the check takes as long as the task", () => {
    const r = routineCost({ perDay: 10, minutes: 2, checkMinutes: 5, hourlyRate: 20 }, 140);
    expect(r.hoursSaved).toBe(0);
    expect(r.paybackDays).toBeNull();
  });
});
