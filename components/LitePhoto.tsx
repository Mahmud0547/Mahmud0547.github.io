"use client";

import { useState } from "react";

/**
 * Wraps a lazy photo. In the light version CSS hides the photo (so the browser never downloads it)
 * and shows a "Show photo · 48 KB" button instead; in the full version the button stays hidden.
 */
export function LitePhoto({
  label,
  size,
  className = "",
  placeholderClassName = "h-full min-h-40 w-full",
  children,
}: {
  label: string;
  size: string;
  className?: string;
  placeholderClassName?: string;
  children: React.ReactNode;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className={`lite-media ${className}`} data-shown={shown || undefined}>
      {children}
      <button
        type="button"
        onClick={() => setShown(true)}
        className={`lite-placeholder flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line bg-paper px-8 py-7 ${placeholderClassName}`}
      >
        <span className="text-lg font-bold text-link">{label}</span>
        <span className="text-sm text-soft">{size}</span>
      </button>
    </div>
  );
}
