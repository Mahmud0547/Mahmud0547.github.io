import Image from "next/image";
import { links } from "@/content/site";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { ContactForm } from "./ContactForm";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const channels = [
  ["Telegram", links.telegram],
  ["Telegram channel", links.channel],
  ["GitHub", links.github],
  ["LinkedIn", links.linkedin],
  ["Instagram", links.instagram],
  ["Fiverr", links.fiverr],
  ["Upwork", links.upwork],
] as const;

export function Contact({ locale }: { locale: Locale }) {
  const t = getMessages(locale).contact;
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="dark-surface scroll-mt-4 bg-deep pb-[72px] pt-16 text-white lg:py-28"
    >
      <div className="container-page flex flex-col gap-7 lg:flex-row lg:gap-[88px]">
        <div className="flex min-w-0 flex-1 flex-col gap-7 lg:gap-6">
          <h2 id="contact-title" className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] lg:max-w-[560px] lg:text-5xl lg:leading-[1.05]">
            {t.title}
          </h2>
          <p className="text-[17px] leading-normal text-mist lg:text-lg">{t.lead}</p>
          <ol className="flex flex-col gap-2.5 lg:gap-3">
            {t.questions.map((question) => (
              <li key={question} className="flex items-start gap-2.5 text-[15px] leading-[1.45] lg:text-base">
                <Image src="/icons/check-saffron.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
                {question}
              </li>
            ))}
          </ol>
          <ul className="flex flex-wrap gap-2 lg:gap-2.5 lg:pt-2">
            {channels.map(([name, href]) => (
              <li key={name}>
                <a
                  href={href}
                  {...external}
                  className="block rounded-full border border-white/16 bg-white/8 px-3.5 py-2 text-sm font-medium hover:bg-white/16 lg:px-4 lg:py-[9px] lg:text-[15px]"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div data-slot="contact-form" className="lg:w-[520px] lg:shrink-0">
          <ContactForm t={t.form} telegram={links.telegram} privacyHref={localePath(locale, "/privacy/")} />
        </div>
      </div>
    </section>
  );
}
