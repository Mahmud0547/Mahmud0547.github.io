"use client";

import { setDone } from "@/lib/lesson-progress";
import { useLessonsDone } from "./useLessonsDone";

type Props = { slug: string; t: { markDone: string; done: string; undo: string } };

/** "I finished this lesson": the reader's own checkmark, shown in the course list. */
export function LessonDone({ slug, t }: Props) {
  const done = useLessonsDone().includes(slug);
  return (
    <div className="flex flex-wrap items-center gap-3 font-sans">
      {done ? (
        <>
          <p className="rounded-full bg-[#e3f4f1] px-4 py-2 font-semibold text-[#0d5e5c]" role="status">✓ {t.done}</p>
          <button type="button" className="text-sm text-soft underline" onClick={() => setDone(slug, false)}>
            {t.undo}
          </button>
        </>
      ) : (
        <button type="button" className="rounded-full bg-lapis px-5 py-3 font-semibold text-white hover:bg-deep" onClick={() => setDone(slug, true)}>
          ✓ {t.markDone}
        </button>
      )}
    </div>
  );
}
