import Image from "next/image";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { getSnapshot } from "@/lib/stats";
import { Pipeline } from "./Pipeline";

export function Hero({ locale }: { locale: Locale }) {
  const t = getMessages(locale).hero;
  const home = localePath(locale);
  return (
    <div className="dark-surface bg-deep pb-12 pt-8 lg:pb-[104px] lg:pt-[72px]">
      <div className="container-page grid items-center gap-[22px] lg:grid-cols-[minmax(0,640px)_minmax(0,576px)] lg:justify-between lg:gap-16">
        <div className="flex min-w-0 flex-col items-start gap-[22px] lg:gap-7">
          <p className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[13px] font-medium text-mist lg:text-sm">
            <Image src="/icons/status-dot.svg" alt="" width={8} height={8} />
            {t.status}
          </p>
          <h1 className="text-[clamp(32px,10vw,40px)] font-extrabold [overflow-wrap:break-word] leading-[1.04] tracking-[-0.03em] text-white lg:text-[68px] lg:leading-[1.02]">
            {t.title}
          </h1>
          <p className="max-w-[580px] text-[17px] leading-normal text-mist lg:text-xl">{t.lead}</p>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row lg:gap-3.5">
            <a href={`${home}#work`} className="rounded-xl bg-saffron px-6 py-[15px] text-center text-base font-semibold text-ink lg:text-[17px]">
              {t.primary}
            </a>
            <a
              href={`${home}#services`}
              className="rounded-xl border-[1.5px] border-white/35 px-6 py-[15px] text-center text-base font-semibold text-white lg:text-[17px]"
            >
              {t.secondary}
            </a>
          </div>
        </div>
        <div>
          <Pipeline locale={locale} stats={getSnapshot()} />
        </div>
      </div>
    </div>
  );
}
