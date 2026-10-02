import Image from "next/image";
import { getMessages, type Locale } from "@/lib/i18n";

export function TrustStrip({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  return (
    <div className="border-b border-line bg-surface">
      <ul aria-label={t.trustLabel} className="container-page flex flex-col gap-3.5 py-6 lg:flex-row lg:gap-14 lg:py-7">
        {t.trust.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[15px] font-medium leading-[1.4] text-ink lg:items-center lg:gap-3 lg:text-base">
            <Image src="/icons/check.svg" alt="" width={20} height={20} className="shrink-0 lg:hidden" />
            <Image src="/icons/check-circle.svg" alt="" width={22} height={22} className="hidden shrink-0 lg:block" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
