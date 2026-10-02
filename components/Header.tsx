import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export type NavItem = { href: string; label: string };

export function navItems(locale: Locale): NavItem[] {
  const t = getMessages(locale);
  const home = localePath(locale);
  return [
    { href: `${home}#work`, label: t.nav.work },
    { href: `${home}#services`, label: t.nav.services },
    { href: `${home}#about`, label: t.nav.about },
    { href: localePath(locale, "/blog/"), label: t.nav.blog },
    { href: `${home}#contact`, label: t.nav.contact },
  ];
}

export function Header({ locale, path }: { locale: Locale; path: string }) {
  const t = getMessages(locale);
  const items = navItems(locale);
  return (
    <header className="dark-surface relative z-40 bg-deep">
      <a
        href="#main"
        className="sr-only rounded-lg bg-saffron px-4 py-2 font-semibold text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        {t.nav.skip}
      </a>
      <div className="container-page flex h-[72px] items-center gap-10 lg:h-[86px]">
        <Logo locale={locale} />
        <nav aria-label={t.nav.main} className="hidden lg:block">
          <ul className="flex gap-8">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-base font-medium text-mist hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-10">
          <LanguageSwitcher locale={locale} path={path} className="hidden lg:block" />
          <a
            href={`${localePath(locale)}#contact`}
            className="hidden rounded-[10px] bg-saffron px-5 py-[11px] font-semibold text-ink lg:block"
          >
            {t.nav.hire}
          </a>
          <MobileMenu items={items} current={locale.toUpperCase()} openLabel={t.nav.openMenu} closeLabel={t.nav.closeMenu}>
            <LanguageSwitcher locale={locale} path={path} />
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
