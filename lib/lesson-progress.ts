// Which course lessons this reader has finished. A per-browser convenience: kept in localStorage,
// never sent anywhere, and the pages work the same when storage is blocked (nothing is marked then).

const KEY = "simorghdev:lessons-done";
const EVENT = "simorghdev:lessons-done";

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function parseDone(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function setDone(slug: string, done: boolean): void {
  const current = parseDone(read()).filter((s) => s !== slug);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(done ? [...current, slug] : current));
  } catch {
    // Storage blocked (private window, settings): the mark simply is not remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** For useSyncExternalStore: the raw stored string is a stable snapshot. */
export function subscribeDone(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const doneSnapshot = read;
export const doneServerSnapshot = () => "[]";
