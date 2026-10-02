import { describe, expect, it } from "vitest";
import { pageMetadata, personJsonLd, sitemapEntries } from "@/lib/seo";

const site = "https://simorghdev.pages.dev";

describe("pageMetadata", () => {
  const meta = pageMetadata({ locale: "ru", path: "/work/simorgh/", title: "T", description: "D" });

  it("points canonical at the localized URL", () => {
    expect(meta.alternates?.canonical).toBe(`${site}/ru/work/simorgh/`);
  });

  it("lists every language with ISO codes and x-default", () => {
    expect(meta.alternates?.languages).toEqual({
      en: `${site}/work/simorgh/`,
      ru: `${site}/ru/work/simorgh/`,
      tg: `${site}/tj/work/simorgh/`,
      "x-default": `${site}/work/simorgh/`,
    });
  });

  it("fills Open Graph and Twitter cards", () => {
    expect(meta.openGraph).toMatchObject({
      title: "T",
      description: "D",
      url: `${site}/ru/work/simorgh/`,
      siteName: "SimorghDev",
      locale: "ru_RU",
      images: [{ url: `${site}/og.png`, width: 1200, height: 630 }],
    });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("uses the bare domain for the English home page", () => {
    expect(pageMetadata({ locale: "en", path: "/", title: "T", description: "D" }).alternates?.canonical).toBe(`${site}/`);
  });
});

describe("sitemapEntries", () => {
  const entries = sitemapEntries();

  it("lists every page once per language", () => {
    expect(entries.map((e) => e.url).sort()).toEqual(
      [
        "/", "/ru/", "/tj/",
        "/work/simorgh/", "/ru/work/simorgh/", "/tj/work/simorgh/",
        "/privacy/", "/ru/privacy/", "/tj/privacy/",
        "/blog/", "/ru/blog/", "/tj/blog/",
        "/blog/how-a-telegram-bot-works/", "/ru/blog/how-a-telegram-bot-works/", "/tj/blog/how-a-telegram-bot-works/",
        "/blog/ai-newsroom-human-in-the-loop/", "/ru/blog/ai-newsroom-human-in-the-loop/", "/tj/blog/ai-newsroom-human-in-the-loop/",
        "/blog/official-data-you-can-trust/", "/ru/blog/official-data-you-can-trust/", "/tj/blog/official-data-you-can-trust/",
        "/blog/access-rules-in-the-database/", "/ru/blog/access-rules-in-the-database/", "/tj/blog/access-rules-in-the-database/",
      ].map((p) => `${site}${p}`).sort(),
    );
  });

  it("links language versions to each other", () => {
    const home = entries.find((e) => e.url === `${site}/tj/`);
    expect(home?.alternates?.languages).toEqual({ en: `${site}/`, ru: `${site}/ru/`, tg: `${site}/tj/` });
  });
});

describe("personJsonLd", () => {
  const data = personJsonLd("en");

  it("describes the person and the service with real profile links", () => {
    const graph = data["@graph"] as Record<string, unknown>[];
    const person = graph.find((n) => n["@type"] === "Person")!;
    expect(person.name).toBe("Mahmud Faiezov");
    expect(person.sameAs).toContain("https://github.com/Mahmud0547");
    expect(person.sameAs).toContain("https://www.fiverr.com/s/3A8051m");
    expect(graph.find((n) => n["@type"] === "ProfessionalService")).toMatchObject({ name: "SimorghDev", url: `${site}/` });
  });
});
