import { describe, expect, it } from "vitest";
import { matchRule, parseAmount, pythonCode } from "@/lib/demos";

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
