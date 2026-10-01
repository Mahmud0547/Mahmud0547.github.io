import { getMessages, htmlLang, localePath, locales, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale, path, className = "" }: { locale: Locale; path: string; className?: string }) {
  const t = getMessages(locale);
  return (
    <nav aria-label={t.nav.language} className={className}>
      <ul className="flex w-fit items-center gap-1 rounded-[10px] bg-white/8 p-1">
        {locales.map((code) => (
          <li key={code}>
            {/* Plain <a>: switching language swaps the root layout, so a full page load is required. */}
            <a
              href={localePath(code, path)}
              hrefLang={htmlLang[code]}
              lang={htmlLang[code]}
              aria-current={code === locale ? "page" : undefined}
              className="block rounded-[7px] px-2.5 py-1.5 text-sm font-semibold text-dim hover:text-white aria-[current=page]:bg-white/16 aria-[current=page]:text-white"
            >
              {code.toUpperCase()}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
