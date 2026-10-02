import { describe, expect, it } from "vitest";
import { cyrillicCheck, matchRule, parseAmount, pythonCode, runChain, toSomoni, tryAccess } from "@/lib/demos";

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
