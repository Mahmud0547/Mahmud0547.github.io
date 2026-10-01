import "../globals.css";
import { RootShell } from "@/components/RootShell";

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
