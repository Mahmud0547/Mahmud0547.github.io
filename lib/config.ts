export const config = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? "https://9.205.154.67.sslip.io/api").replace(/\/$/, ""),
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://simorghdev.pages.dev").replace(/\/$/, ""),
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAFLEMkH-Xwdvqv8J",
  /** Google Search Console ownership token (public by design). */
  googleVerification: "HH6lnTnT8LMIOmSP52tYTV06E6nVdVjs_zkp5ochbAo",
} as const;
