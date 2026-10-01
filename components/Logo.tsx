import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";

export function Logo({ locale }: { locale: Locale }) {
  return (
    <Link href={localePath(locale)} className="flex items-center gap-2.5 text-white">
      <Image src="/brand/mark.svg" alt="" width={30} height={30} priority className="size-[26px] lg:size-[30px]" />
      <span className="text-lg font-bold tracking-[-0.01em] lg:text-xl">SimorghDev</span>
    </Link>
  );
}
