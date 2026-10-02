import Image from "next/image";
import { links, skills } from "@/content/site";
import { publicFileKB } from "@/lib/assets";
import { format, getMessages, type Locale } from "@/lib/i18n";
import { LitePhoto } from "./LitePhoto";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function About({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const t = messages.about;
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-4 pb-[72px] pt-16 lg:pb-[120px] lg:pt-28">
      <div className="container-page grid items-center gap-7 lg:grid-cols-[520px_1fr] lg:gap-[72px]">
        <LitePhoto
          label={messages.lite.showPhoto}
          size={format(messages.lite.size, { size: publicFileKB("/images/mahmud.webp") })}
          placeholderClassName="h-[340px] w-full lg:h-[560px]"
        >
          <Image
            src="/images/mahmud.webp"
            alt={t.photoAlt}
            width={800}
            height={770}
            loading="lazy"
            sizes="(min-width: 1024px) 520px, 100vw"
            className="h-[340px] w-full rounded-[20px] object-cover lg:h-[560px] lg:rounded-3xl"
          />
        </LitePhoto>
        <div className="flex min-w-0 flex-col gap-7 lg:gap-6">
          <h2 id="about-title" className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] lg:text-5xl">
            {t.title}
          </h2>
          {t.paragraphs.map((text) => (
            <p key={text} className="font-serif text-base leading-[1.65] lg:text-lg">
              {text}
            </p>
          ))}
          <dl className="flex flex-col gap-3.5 lg:flex-row lg:gap-10 lg:pt-2">
            {t.facts.map((fact) => (
              <div key={fact.label} className="flex gap-2 lg:flex-col lg:gap-1">
                <dt className="w-[110px] shrink-0 text-sm text-soft lg:w-auto">{fact.label}</dt>
                <dd className="text-[15px] font-semibold lg:text-base">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-4 lg:gap-3.5 lg:pt-2">
            {(Object.keys(skills) as (keyof typeof skills)[]).map((group) => (
              <div key={group} className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                <h3 className="text-sm font-semibold text-link lg:w-[120px] lg:shrink-0 lg:text-[15px]">{t.skillGroups[group]}</h3>
                <ul className="flex flex-wrap gap-2">
                  {skills[group].map((skill) => (
                    <li key={skill} className="rounded-full border border-line bg-surface px-2.5 py-[5px] text-[13px] font-medium">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-surface px-[18px] py-4 lg:flex-row lg:items-center lg:gap-4 lg:px-5">
            <div className="flex-1">
              <p className="text-[15px] font-semibold lg:text-base">{t.certificate.name}</p>
              <p className="text-[13px] text-soft lg:text-sm">{t.certificate.details}</p>
            </div>
            <a href={links.certificate} {...external} className="text-sm font-semibold text-link lg:text-[15px]">
              {t.certificate.verify}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
