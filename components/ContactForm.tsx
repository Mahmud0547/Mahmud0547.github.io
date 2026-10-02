"use client";

import { useRef, useState, type FormEvent } from "react";
import { config } from "@/lib/config";
import type { Messages } from "@/lib/i18n";
import { loadTurnstile, type TurnstileApi } from "@/lib/turnstile";

type Status = "idle" | "sending" | "sent" | "error" | "rate-limited";

const TOKEN_WAIT_MS = 8000;

type ContactFormProps = {
  t: Messages["contact"]["form"];
  telegram: string;
  privacyHref: string;
};

const field = "rounded-[10px] border border-line bg-paper px-3.5 py-3 text-base text-ink placeholder:text-soft";
const label = "text-sm font-semibold text-ink";

export function ContactForm({ t, telegram, privacyHref }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const sending = useRef(false);
  const token = useRef<string | null>(null);
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const container = useRef<HTMLDivElement>(null);

  function startTurnstile() {
    if (widget.current || !container.current) return;
    const element = container.current;
    loadTurnstile()
      .then((api) => {
        if (widget.current) return;
        const id = api.render(element, {
          sitekey: config.turnstileSiteKey,
          appearance: "interaction-only",
          callback: (value) => {
            token.current = value;
          },
          "expired-callback": () => {
            token.current = null;
          },
        });
        widget.current = { api, id };
      })
      .catch(() => {
        // The submit handler reports the missing token.
      });
  }

  async function waitForToken(): Promise<string | null> {
    startTurnstile();
    const deadline = Date.now() + TOKEN_WAIT_MS;
    while (!token.current && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return token.current;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setStatus("sending");
    const data = new FormData(event.currentTarget);
    try {
      const value = await waitForToken();
      if (!value) throw new Error("no token");
      const response = await fetch(`${config.apiUrl}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          message: String(data.get("message") ?? "").trim(),
          website: String(data.get("website") ?? ""),
          token: value,
        }),
      });
      if (response.ok) {
        setStatus("sent");
        return;
      }
      setStatus(response.status === 429 ? "rate-limited" : "error");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
    // A Turnstile token is single-use: get a fresh one for the next attempt.
    token.current = null;
    if (widget.current) widget.current.api.reset(widget.current.id);
  }

  if (status === "sent") {
    return (
      <div className="rounded-[20px] bg-surface p-6 text-ink lg:rounded-3xl lg:p-9">
        <p role="status" className="text-lg font-semibold leading-normal">
          {t.sent}
        </p>
      </div>
    );
  }

  const failed = status === "error" || status === "rate-limited";

  return (
    <form
      onSubmit={onSubmit}
      onFocus={startTurnstile}
      className="flex flex-col gap-4 rounded-[20px] bg-surface p-6 text-ink lg:gap-5 lg:rounded-3xl lg:p-9"
    >
      <label className="flex flex-col gap-2">
        <span className={label}>{t.name}</span>
        <input name="name" required maxLength={100} autoComplete="name" placeholder={t.placeholderName} className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>{t.email}</span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder={t.placeholderEmail} className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>{t.message}</span>
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={2000}
          rows={4}
          placeholder={t.placeholderMessage}
          className={`${field} resize-y`}
        />
      </label>
      {/* Honeypot: hidden from people and assistive technology; bots that fill it are ignored by the server. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <div ref={container} className="empty:hidden" />
      {failed && (
        <p role="alert" className="rounded-[10px] bg-paper px-3.5 py-3 text-sm leading-normal text-ink">
          {status === "rate-limited" ? t.tooMany : t.error}{" "}
          <a href={telegram} target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">
            Telegram
          </a>
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-[10px] bg-saffron px-6 py-3.5 text-base font-semibold text-on-accent disabled:opacity-70"
      >
        {status === "sending" ? t.sending : t.send}
      </button>
      <p className="text-[13px] leading-normal text-soft">
        {t.note}{" "}
        <a href={privacyHref} className="font-medium text-link underline">
          {t.privacy}
        </a>
      </p>
    </form>
  );
}
