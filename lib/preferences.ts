// Visitor preferences that change how every page looks: colour theme and the light (slow-internet) version.
// Both live on <html> as data attributes so CSS can react before React loads:
//   data-theme="light" | "dark"   — absent means "same as the device"
//   data-lite="auto" | "manual"   — absent means the full version
// The script in headScript() sets them during HTML parsing, before the first paint, so there is no flash.

export const THEME_KEY = "theme";
export const LITE_KEY = "lite";

export const themeChoices = ["light", "system", "dark"] as const;
export type ThemeChoice = (typeof themeChoices)[number];

/** Connection types that count as slow internet (Network Information API, Chromium browsers). */
export const slowConnections = ["slow-2g", "2g", "3g"];

type Connection = { saveData?: boolean; effectiveType?: string };

/** Whether the light version should switch on by itself: data saver is on or the connection is slow. */
export function isSlowConnection(connection: Connection | undefined): boolean {
  if (!connection) return false;
  return connection.saveData === true || slowConnections.includes(connection.effectiveType ?? "");
}

/**
 * Light version state from the stored choice ("on" / "off" / nothing) and the connection.
 * An explicit choice always wins; otherwise a slow connection turns it on automatically.
 */
export function liteState(stored: string | null, slow: boolean): "manual" | "auto" | null {
  if (stored === "on") return "manual";
  if (stored === "off") return null;
  return slow ? "auto" : null;
}

/** Inline script for <head>. Kept tiny and dependency-free; its SHA-256 hash goes into the CSP (scripts/headers.mjs). */
export function headScript(): string {
  return `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);var c=navigator.connection;var s=!!c&&(c.saveData===true||${JSON.stringify(slowConnections)}.indexOf(c.effectiveType||"")>-1);var l=localStorage.getItem("${LITE_KEY}");var m=l==="on"?"manual":l==="off"?null:s?"auto":null;if(m)d.setAttribute("data-lite",m)}catch(e){}})()`;
}

// ── Browser-only helpers (used by client components) ────────────────────────

function root(): HTMLElement {
  return document.documentElement;
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice still applies to this page, it just is not remembered.
  }
}

/** Calls onChange whenever data-theme or data-lite on <html> changes (from this tab or a switcher elsewhere on the page). */
export function subscribeRoot(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme", "data-lite"] });
  return () => observer.disconnect();
}

export function getThemeChoice(): ThemeChoice {
  const value = root().getAttribute("data-theme");
  return value === "light" || value === "dark" ? value : "system";
}

export function setThemeChoice(choice: ThemeChoice) {
  if (choice === "system") root().removeAttribute("data-theme");
  else root().setAttribute("data-theme", choice);
  store(THEME_KEY, choice === "system" ? null : choice);
}

/** The theme after the light → system → dark cycle used by the single phone button. */
export function nextTheme(choice: ThemeChoice): ThemeChoice {
  return themeChoices[(themeChoices.indexOf(choice) + 1) % themeChoices.length];
}

export function getLite(): "manual" | "auto" | null {
  const value = root().getAttribute("data-lite");
  return value === "manual" || value === "auto" ? value : null;
}

export function setLite(on: boolean) {
  if (on) root().setAttribute("data-lite", "manual");
  else root().removeAttribute("data-lite");
  store(LITE_KEY, on ? "on" : "off");
}
