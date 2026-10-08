import { describe, expect, it } from "vitest";
import { NEWS_BY_UTC_HOUR, bestCard, cyrillicCheck, homePage, isWorkingHour, loadSeconds, matchRule, outsideHours, parseAmount, partsFor, pythonCode, rankCards, routineCost, runChain, toLocalHours, toSomoni, tryAccess, wordKeys } from "@/lib/demos";

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

describe("lesson 6: answering from documents", () => {
  const cards = [
    { id: "menu", title: "Menu and prices", text: "Plov costs 35 somoni, salad 15 somoni." },
    { id: "delivery", title: "Delivery", text: "We deliver across Dushanbe from 10:00 to 22:00, delivery is free from 100 somoni." },
    { id: "hours", title: "Opening hours", text: "We are open every day from 9:00 to 23:00." },
  ];
  const stop = ["the", "and", "you", "how", "much", "what", "does", "are", "your", "for", "can", "from"];

  it("finds the card that shares the question's words", () => {
    const ranked = rankCards("How much does plov cost?", cards, stop);
    expect(ranked[0].id).toBe("menu");
    expect(ranked[0].words).toEqual(["plov", "cost"]);
    expect(bestCard(ranked)).toBe("menu");
  });

  it("matches different forms of a word by its first letters", () => {
    expect(rankCards("Do you do deliveries?", cards, stop)[0].id).toBe("delivery");
  });

  it("admits it does not know when no card fits", () => {
    const ranked = rankCards("Is there a helicopter pad?", cards, stop);
    expect(bestCard(ranked)).toBeNull();
  });

  it("ignores stop words and very short words", () => {
    expect(wordKeys("How much is it for you?", stop)).toEqual([]);
  });
});

describe("article 2: news does not sleep", () => {
  it("uses the measured total", () => {
    expect(NEWS_BY_UTC_HOUR.reduce((s, c) => s + c, 0)).toBe(1498);
  });

  it("moves counts to local time", () => {
    const dubai = toLocalHours(NEWS_BY_UTC_HOUR, 4);
    expect(dubai[4]).toBe(NEWS_BY_UTC_HOUR[0]);
    expect(dubai[3]).toBe(NEWS_BY_UTC_HOUR[23]);
  });

  it("62% of the news comes outside 9:00–18:00 Dubai time", () => {
    const r = outsideHours(toLocalHours(NEWS_BY_UTC_HOUR, 4), 9, 18);
    expect(r.outside).toBe(924);
    expect(Math.round(r.share * 100)).toBe(62);
  });

  it("handles night shifts that cross midnight", () => {
    expect(isWorkingHour(23, 22, 6)).toBe(true);
    expect(isWorkingHour(3, 22, 6)).toBe(true);
    expect(isWorkingHour(12, 22, 6)).toBe(false);
    expect(outsideHours([1, 1, 1], 0, 0).share).toBe(1);
  });
});

import { lessonStrings } from "@/components/blog/strings-lessons";
describe.each(["en", "ru", "tj"] as const)("lesson 6 presets in %s", (locale) => {
  const k = lessonStrings[locale].knowledge;
  const cards = k.cards.map((c) => ({ ...c, text: c.text.replace("{price}", "35") }));
  it.each(k.presets.map((q, i) => [q, k.expect[i]] as const))("“%s” → %s", (question, expected) => {
    expect(bestCard(rankCards(question, cards, k.stop))).toBe(expected);
  });
});

import { DELAY_BY_HOUR, DELAY_STATS, PEOPLE, SERVERS, checkEvery, distanceKm, makeLandTest, messageTrip, telegramFor, waitsUntilCheck } from "@/lib/demos";
import { LAND } from "@/lib/land-mask";
describe("lesson 7: a message's trip", () => {
  const place = (list: typeof PEOPLE, id: string) => list.find((p) => p.id === id)!;
  it("measures great-circle distances", () => {
    // Dushanbe – Amsterdam is about 5,000 km in a straight line.
    expect(Math.round(distanceKm(place(PEOPLE, "dushanbe"), { id: "ams", lat: 52.37, lon: 4.9 }) / 100) * 100).toBe(5000);
    expect(distanceKm(place(PEOPLE, "dubai"), place(PEOPLE, "dubai"))).toBe(0);
  });
  it("sends Central Asia and the Middle East through Amsterdam, New York through Miami", () => {
    expect(telegramFor(place(PEOPLE, "almaty")).id).toBe("amsterdam");
    expect(telegramFor(place(PEOPLE, "dubai")).id).toBe("amsterdam");
    expect(telegramFor(place(PEOPLE, "newyork")).id).toBe("miami");
  });
  it("adds up four legs at 200 km per millisecond", () => {
    const trip = messageTrip(place(PEOPLE, "dushanbe"), place(SERVERS, "frankfurt"));
    expect(trip.legs).toHaveLength(4);
    expect(trip.legs[0]!.km).toBeCloseTo(trip.legs[3]!.km);
    expect(trip.ms).toBeCloseTo(trip.km / 200);
    // There and back is about 11,000 km: ~55 ms of light in glass.
    expect(Math.round(trip.ms)).toBeGreaterThan(50);
    expect(Math.round(trip.ms)).toBeLessThan(60);
  });
  it("knows land from sea", () => {
    const isLand = makeLandTest(LAND);
    expect(isLand(38.56, 68.77)).toBe(true); // Dushanbe
    expect(isLand(48.86, 2.35)).toBe(true); // Paris
    expect(isLand(0, -30)).toBe(false); // Atlantic
    expect(isLand(-30, 80)).toBe(false); // Indian Ocean
  });
});

describe("article 3: how fast a bot sees the news", () => {
  const sum = (col: number) => DELAY_BY_HOUR.reduce((s, row) => s + row[col]!, 0);
  it("the hour × delay table matches the measured totals", () => {
    expect(DELAY_BY_HOUR).toHaveLength(24);
    expect(DELAY_BY_HOUR.flat().reduce((a, b) => a + b, 0)).toBe(DELAY_STATS.all.n);
    expect(sum(0) + sum(1)).toBe(DELAY_STATS.all.le30);
    expect(sum(0) + sum(1) + sum(2)).toBe(DELAY_STATS.all.le60);
    expect(sum(4)).toBe(DELAY_STATS.all.gt180);
    expect(DELAY_STATS.bbc.n + DELAY_STATS.aljazeera.n).toBe(DELAY_STATS.all.n);
  });
  it("a 30-minute check waits 15 minutes on average and keeps the measured median", () => {
    const r = checkEvery(30);
    expect(r).toMatchObject({ averageWait: 15, worstWait: 30, checksPerDay: 96 });
    expect(r.estimatedMedian).toBeCloseTo(DELAY_STATS.all.median);
    expect(checkEvery(5).estimatedMedian).toBeCloseTo(25.3);
  });
  it("waits until the next check", () => {
    expect(waitsUntilCheck([0, 1, 29, 31], 30)).toEqual([0, 29, 1, 29]);
  });
});
