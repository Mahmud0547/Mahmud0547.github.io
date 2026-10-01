import Image from "next/image";
import Link from "next/link";
import { links, projects, simorghTags } from "@/content/site";
import { formatCount } from "@/lib/format";
import { format, getMessages, localePath, type Locale } from "@/lib/i18n";
import { getSnapshot } from "@/lib/stats";
import { Section } from "./Section";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((tag) => (
        <li key={tag} className="rounded-full border border-line bg-paper px-2.5 py-[5px] text-[13px] font-medium">
          {tag}
        </li>
      ))}
    </ul>
  );
}

export function Work({ locale }: { locale: Locale }) {
  const t = getMessages(locale).work;
  const s = t.simorgh;
  const articles = formatCount(getSnapshot().articles, locale);

  return (
    <Section
      id="work"
      title={t.title}
      lead={t.lead}
      action={
        <a href={links.github} {...external} className="font-semibold text-lapis">
          {t.allProjects}
        </a>
      }
    >
      <article className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white lg:grid lg:grid-cols-[560px_1fr] lg:rounded-3xl">
        <div className="flex flex-col items-start gap-[18px] px-5 py-6 lg:order-1 lg:gap-6 lg:py-12 lg:pl-12 lg:pr-10">
          <p className="rounded-full bg-lapis/8 px-2.5 py-[5px] text-[13px] font-semibold text-lapis">{t.caseLabel}</p>
          <h3 className="text-[28px] font-extrabold tracking-[-0.02em] lg:text-4xl">{s.name}</h3>
          <p className="text-base leading-[1.45] text-soft lg:max-w-[472px] lg:text-lg">{s.summary}</p>
          <dl className="flex flex-col gap-[18px] lg:gap-6">
            {[
              [s.problemLabel, s.problem],
              [s.solutionLabel, s.solution],
              [s.resultLabel, format(s.result, { count: articles })],
            ].map(([label, text]) => (
              <div key={label} className="flex flex-col gap-1 lg:gap-1.5">
                <dt className="text-[13px] font-semibold text-lapis lg:text-sm">{label}</dt>
                <dd className="font-serif text-[15px] leading-[1.6] lg:text-base">{text}</dd>
              </div>
            ))}
          </dl>
          <Tags items={simorghTags} />
          <Link
            href={localePath(locale, "/work/simorgh/")}
            className="rounded-xl border-[1.5px] border-lapis px-5 py-3 text-base font-semibold text-lapis hover:bg-lapis/8"
          >
            {t.readCase}
          </Link>
        </div>
        <div className="relative order-first h-[220px] overflow-hidden bg-haze lg:order-2 lg:h-auto lg:min-h-[640px]">
          <Image
            src="/work/simorgh-panel.webp"
            alt={format(t.screenshotAlt, { name: s.name })}
            width={2000}
            height={1125}
            sizes="(min-width: 1024px) 1000px, 480px"
            className="absolute left-5 top-7 h-[270px] w-[480px] max-w-none rounded-[10px] shadow-[0_12px_28px_rgba(20,26,51,0.16)] lg:left-14 lg:top-20 lg:h-[563px] lg:w-[1000px] lg:rounded-[14px] lg:shadow-[0_24px_48px_rgba(20,26,51,0.18)]"
          />
        </div>
      </article>

      <div className="mt-7 grid gap-7 lg:mt-10 lg:grid-cols-3 lg:gap-6">
        {(["kursi", "kamarob", "dawn"] as const).map((key) => {
          const project = projects[key];
          const copy = t[key];
          return (
            <article key={key} className="overflow-hidden rounded-[18px] border border-line bg-white lg:rounded-[20px]">
              <Image
                src={project.image}
                alt={format(t.screenshotAlt, { name: copy.name })}
                width={1280}
                height={800}
                loading="lazy"
                sizes="(min-width: 1024px) 410px, 100vw"
                className="h-[170px] w-full object-cover object-top lg:h-[220px]"
              />
              <div className="flex flex-col gap-2.5 px-5 pb-[22px] pt-5 lg:gap-3 lg:px-8 lg:pb-8 lg:pt-7">
                <h3 className="text-xl font-bold lg:text-2xl lg:tracking-[-0.01em]">{copy.name}</h3>
                <p className="text-[15px] leading-normal text-soft lg:text-base">{copy.summary}</p>
                <div className="pt-1">
                  <Tags items={project.tags} />
                </div>
                <div className="mt-1 flex gap-5 text-[15px] font-semibold text-lapis">
                  <a href={project.live} {...external}>
                    {t.live}
                  </a>
                  <a href={project.code} {...external}>
                    {t.code}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
