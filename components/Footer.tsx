import { links } from "@/content/site";
import { format, getMessages, type Locale } from "@/lib/i18n";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Footer({ locale }: { locale: Locale }) {
  const t = getMessages(locale).footer;
  return (
    <footer className="bg-darker">
      <div className="container-page flex flex-col-reverse gap-3.5 pb-8 pt-7 text-[13px] text-dim lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-8 lg:text-sm">
        <p className="leading-[1.45]">{format(t.copyright, { year: new Date().getFullYear() })}</p>
        <ul className="flex gap-5 text-sm font-medium text-mist lg:gap-6">
          <li>
            <a href={links.github} {...external} className="hover:text-white">
              GitHub
            </a>
          </li>
          <li>
            <a href={links.telegram} {...external} className="hover:text-white">
              Telegram
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
