"use client";

import { useId, useState } from "react";
import { tryAccess, type AccessResult, type Action, type Role } from "@/lib/demos";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

const roles: Role[] = ["visitor", "member", "editor", "admin"];
const actions: Action[] = ["readPublic", "readMembers", "writePost", "readInbox", "makeAdmin"];
const tone: Record<AccessResult, string> = {
  allowed: "bg-success-soft text-success",
  hidden: "bg-surface text-ink",
  refused: "bg-tint-strong text-link",
  leaked: "bg-danger-soft text-danger",
};

export function AccessDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].access;
  const id = useId();
  const [role, setRole] = useState<Role>("visitor");
  const [action, setAction] = useState<Action>("readMembers");
  const [rulesIn, setRulesIn] = useState<"app" | "database">("app");
  const [result, setResult] = useState<AccessResult | null>(null);
  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setResult(null);
  };

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm" htmlFor={`${id}-role`}>
          {t.role}
          <select id={`${id}-role`} className={ui.field} value={role} onChange={(e) => change(setRole)(e.target.value as Role)}>
            {roles.map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor={`${id}-action`}>
          {t.action}
          <select id={`${id}-action`} className={ui.field} value={action} onChange={(e) => change(setAction)(e.target.value as Action)}>
            {actions.map((a) => <option key={a} value={a}>{t.actions[a]}</option>)}
          </select>
        </label>
      </div>
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-2 text-sm text-soft">{t.rulesIn}</legend>
        {(["app", "database"] as const).map((where) => (
          <button key={where} type="button" aria-pressed={rulesIn === where} onClick={() => change(setRulesIn)(where)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${rulesIn === where ? "bg-lapis text-white" : "border border-line bg-surface"}`}>
            {where === "app" ? t.inApp : t.inDb}
          </button>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={ui.button} onClick={() => setResult(tryAccess(role, action, rulesIn, "app"))}>📱 {t.viaApp}</button>
        <button type="button" className={ui.button} onClick={() => setResult(tryAccess(role, action, rulesIn, "api"))}>⌨️ {t.viaApi}</button>
      </div>
      <p aria-live="polite" className={`min-h-12 rounded-xl px-4 py-3 font-semibold ${result ? tone[result] : ""}`}>
        {result && t.results[result]}
      </p>
    </DemoFrame>
  );
}
