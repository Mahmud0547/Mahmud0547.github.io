"use client";

import { useEffect, useRef, useState } from "react";
import type { NavItem } from "./Header";

export function MobileMenu({
  items,
  current,
  openLabel,
  closeLabel,
  children,
}: {
  items: NavItem[];
  current: string;
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* The language chip and the menu icon are one control: the language switcher lives inside the menu. */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 text-white"
      >
        <span className="rounded-full bg-white/12 px-2.5 py-1.5 text-[13px] font-semibold">{current}</span>
        {/* Name = visible "EN" + this text, so voice control users can say what they see (WCAG 2.5.3). */}
        <span className="sr-only">{open ? closeLabel : openLabel}</span>
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-[10px] bg-white/8">
          <svg width="20" height="20" viewBox="0 0 20 20">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </span>
      </button>
      <div id="mobile-menu" hidden={!open} className="absolute inset-x-0 top-full border-t border-white/10 bg-deep px-5 pb-6 pt-2">
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => setOpen(false)} className="block py-3 text-lg font-semibold text-white">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
