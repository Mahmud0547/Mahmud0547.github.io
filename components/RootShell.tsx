import { onest, sourceSerif } from "@/lib/fonts";
import { htmlLang, type Locale } from "@/lib/i18n";
import { headScript } from "@/lib/preferences";

export function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    // The head script sets data-theme / data-lite before React hydrates, so <html> legitimately differs from the server HTML.
    <html lang={htmlLang[locale]} className={`${onest.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      {/* App Router root layouts render <head> directly (node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md). */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript() }} />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
