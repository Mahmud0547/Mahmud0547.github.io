export const links = {
  telegram: "https://t.me/Simorgh_Dev",
  linkedin: "https://www.linkedin.com/in/mahmud-faiezov",
  instagram: "https://www.instagram.com/mahmud.simorghdev",
  fiverr: "https://www.fiverr.com/s/3A8051m",
  upwork: "https://www.upwork.com/freelancers/~01b20f000a77d7d8e3",
  github: "https://github.com/Mahmud0547",
  certificate: "https://freecodecamp.org/certification/makha_0547/responsive-web-design-v9",
} as const;

export const simorghTags = ["Python", "FastAPI", "aiogram", "Next.js", "Docker", "Azure"];

export const projects = {
  kamarob: {
    live: "https://mahmud0547.github.io/kamarob-nature-fund/",
    code: "https://github.com/Mahmud0547/kamarob-nature-fund",
    image: "/work/kamarob.webp",
    tags: ["JavaScript", "Supabase", "i18n"],
  },
  dawn: {
    live: "https://mahmud0547.github.io/simorgh-dawn/",
    code: "https://github.com/Mahmud0547/simorgh-dawn",
    image: "/work/dawn.webp",
    tags: ["JavaScript", "Physics", "Charts"],
  },
} as const;

export const skills = {
  backend: ["Python", "FastAPI", "aiogram", "SQLAlchemy", "SQL"],
  frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  ai: ["LLM APIs", "Prompt design", "Content pipelines"],
  infrastructure: ["Docker", "Linux", "Azure", "Git"],
} as const;

export const packages = [
  { price: 50, recommended: false },
  { price: 140, recommended: true },
  { price: 320, recommended: false },
] as const;

/** Date of the last change to the privacy page text. */
export const privacyUpdated = "2026-10-01T12:00:00Z";
