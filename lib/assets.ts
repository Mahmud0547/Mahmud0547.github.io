import { statSync } from "node:fs";
import { join } from "node:path";

/** Size of a file in public/, in whole kilobytes (at least 1), read at build time for "Show photo · 48 KB". */
export function publicFileKB(src: string): number {
  const bytes = statSync(join(process.cwd(), "public", src)).size;
  return Math.max(1, Math.round(bytes / 1024));
}
