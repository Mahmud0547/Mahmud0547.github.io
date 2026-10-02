import Image from "next/image";
import { links, packages } from "@/content/site";
import { formatPrice } from "@/lib/format";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { Section } from "./Section";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Services({ locale }: { locale: Locale }) {
  const t = getMessages(locale).services;
  const orders = [
    { href: links.fiverr, label: t.fiverr, short: "Fiverr" },
    { href: links.upwork, label: t.upwork, short: "Upwork" },
  ];
  return (
    <Section id="services" title={t.title} lead={t.lead} className="bg-surface">
      <ul className="grid gap-7 lg:grid-cols-3 lg:gap-6">
        {t.packages.map((item, index) => {
          const { price, recommended } = packages[index];
          return (
            <li
              key={item.name}
              className={`flex flex-col gap-4 rounded-[18px] px-[22px] pb-[22px] pt-6 lg:gap-5 lg:rounded-[20px] lg:p-8 ${
                recommended ? "dark-surface bg-deep text-white" : "bg-paper text-ink"
              }`}
            >
              <div className="flex flex-col items-start gap-1 lg:gap-1.5">
                {recommended && (
                  <p className="rounded-full bg-saffron px-2.5 py-[5px] text-[13px] font-semibold text-on-accent">{t.recommended}</p>
                )}
                <div className="flex items-baseline gap-3 lg:flex-col lg:items-start lg:gap-1.5">
                  <p className="text-[40px] font-extrabold tracking-[-0.03em] lg:text-5xl">{formatPrice(price, locale)}</p>
                  <div className="flex flex-col gap-0.5 lg:gap-1.5">
                    <h3 className="text-lg font-bold lg:text-[22px]">{item.name}</h3>
                    <p className={`text-[13px] lg:text-[15px] ${recommended ? "text-dim" : "text-soft"}`}>{item.terms}</p>
                  </div>
                </div>
              </div>
              <ul className="flex flex-1 flex-col gap-2.5 lg:gap-3">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[15px] leading-[1.4] lg:text-base">
                    <Image
                      src={recommended ? "/icons/check-saffron.svg" : "/icons/check.svg"}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 shrink-0"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 lg:mt-auto lg:gap-2.5">
                {orders.map((order) => (
                  <a
                    key={order.short}
                    href={order.href}
                    {...external}
                    aria-label={order.label}
                    className={`flex-1 rounded-xl px-4 py-[15px] text-center text-[15px] font-semibold lg:px-[22px] lg:py-3.5 ${
                      recommended ? "bg-saffron text-on-accent" : "bg-lapis text-white"
                    }`}
                  >
                    <span className="lg:hidden">{order.short}</span>
                    <span className="hidden lg:inline">{order.label}</span>
                  </a>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-link/6 p-5 lg:mt-12 lg:flex-row lg:items-center lg:gap-6 lg:px-7 lg:py-[22px]">
        <div className="flex-1">
          <p className="text-[17px] font-bold lg:text-lg">{t.review.title}</p>
          <p className="mt-1 text-[15px] leading-[1.45] text-soft lg:text-base">{t.review.text}</p>
        </div>
        <a
          href={`${localePath(locale)}#contact`}
          className="shrink-0 rounded-xl bg-lapis px-[22px] py-[15px] text-center font-semibold text-white lg:py-3.5"
        >
          {t.review.cta}
        </a>
      </div>
    </Section>
  );
}
