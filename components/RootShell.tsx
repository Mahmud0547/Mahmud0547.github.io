import { onest, sourceSerif } from "@/lib/fonts";

export function RootShell({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${onest.variable} ${sourceSerif.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
