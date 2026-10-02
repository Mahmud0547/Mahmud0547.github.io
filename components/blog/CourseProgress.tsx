"use client";

import Link from "next/link";
import { format } from "@/lib/locale";
import { useLessonsDone } from "./useLessonsDone";

export interface LessonLink {
  slug: string;
  href: string;
  title: string;
  minutes: string;
  lang: string;
}

type Props = { lessons: LessonLink[]; current?: string; t: { progress: string; lesson: string } };

/** The course as a numbered path: finished lessons get a checkmark, the open one is highlighted. */
export function CourseProgress({ lessons, current, t }: Props) {
  const done = useLessonsDone();
  const finished = lessons.filter((l) => done.includes(l.slug)).length;
  return (
    <div className="flex flex-col gap-4 font-sans">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-soft">{format(t.progress, { n: finished, total: lessons.length })}</p>
        <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full rounded-full bg-turquoise transition-[width] motion-reduce:transition-none" style={{ width: `${(finished / lessons.length) * 100}%` }} />
        </div>
      </div>
      <ol className="flex flex-col gap-2">
        {lessons.map((lesson, i) => {
          const isDone = done.includes(lesson.slug);
          const isCurrent = lesson.slug === current;
          return (
            <li key={lesson.slug}>
              <Link
                href={lesson.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl border p-3 hover:border-lapis ${isCurrent ? "border-lapis bg-[#eef1f9]" : "border-line bg-white"}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isDone ? "bg-turquoise text-white" : "bg-paper text-ink"}`}
                  aria-hidden="true"
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs text-soft">{format(t.lesson, { n: i + 1, total: lessons.length })} · {lesson.minutes}</span>
                  <span className="font-semibold leading-snug" lang={lesson.lang}>{lesson.title}</span>
                </span>
                {isDone && <span className="sr-only">✓</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
