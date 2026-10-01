import { onest, sourceSerif } from "@/lib/fonts";
import { htmlLang, type Locale } from "@/lib/i18n";

export function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={htmlLang[locale]} className={`${onest.variable} ${sourceSerif.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
