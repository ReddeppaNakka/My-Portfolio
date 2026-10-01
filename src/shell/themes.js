import { lazy } from "react";

// Each theme is its own code-split chunk; switching only downloads what's needed.
export const THEMES = [
  {
    id: "minimal",
    name: "Minimal",
    blurb: "Clean, dark, recruiter-friendly",
    component: lazy(() => import("../themes/minimal/MinimalTheme")),
  },
  {
    id: "temple",
    name: "Night Temple",
    blurb: "Cinematic 3D scroll journey",
    component: lazy(() => import("../themes/temple/TempleTheme")),
  },
  {
    id: "bento",
    name: "Bento",
    blurb: "Neo-brutalist grid",
    component: lazy(() => import("../themes/bento/BentoTheme")),
  },
  {
    id: "os",
    name: "Reddy OS",
    blurb: "A desktop with a working terminal",
    component: lazy(() => import("../themes/os/OsTheme")),
  },
];

export const DEFAULT_THEME = "minimal";

export const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES[0];
