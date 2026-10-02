"use client";

import { useMemo, useSyncExternalStore } from "react";
import { doneServerSnapshot, doneSnapshot, parseDone, subscribeDone } from "@/lib/lesson-progress";

export function useLessonsDone(): string[] {
  const raw = useSyncExternalStore(subscribeDone, doneSnapshot, doneServerSnapshot);
  return useMemo(() => parseDone(raw), [raw]);
}
