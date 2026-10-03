import { lazy } from "react";

// Each theme is its own code-split chunk; switching only downloads what's needed.
export const THEMES = [
  {
    id: "minimal",
    name: "Minimal",
    blurb: "Clean, dark, recruiter-friendly",
    thumb: "/photos/switcher/minimal.webp",
    look: { bg: "#0b1120", ink: "#e2e8f0", accent: "#fcd34d" },
    component: lazy(() => import("../themes/minimal/MinimalTheme")),
  },
  {
    id: "temple",
    name: "Night Temple",
    blurb: "Cinematic 3D scroll journey",
    thumb: "/photos/switcher/temple.webp",
    look: { bg: "#06080c", ink: "#ece6d9", accent: "#e0492f" },
    component: lazy(() => import("../themes/temple/TempleTheme")),
  },
  {
    id: "bento",
    name: "Bento",
    blurb: "Neo-brutalist grid",
    thumb: "/photos/switcher/bento.webp",
    look: { bg: "#f4efe6", ink: "#111111", accent: "#ffd23f" },
    component: lazy(() => import("../themes/bento/BentoTheme")),
  },
  {
    id: "os",
    name: "Reddy OS",
    blurb: "A desktop with a working terminal",
    thumb: "/photos/switcher/os.webp",
    look: { bg: "#1e1b4b", ink: "#ffffff", accent: "#a5b4fc" },
    component: lazy(() => import("../themes/os/OsTheme")),
  },
];

export const DEFAULT_THEME = "minimal";

export const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES[0];
