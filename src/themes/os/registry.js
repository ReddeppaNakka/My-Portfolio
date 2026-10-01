import { projects } from "../../data/portfolio";
import { APP_META } from "./wm";
import About from "./apps/About";
import Projects from "./apps/Projects";
import ProjectDetail from "./apps/ProjectDetail";
import Experience from "./apps/Experience";
import Terminal from "./apps/Terminal";
import Resume from "./apps/Resume";
import Certificates from "./apps/Certificates";
import Contact from "./apps/Contact";
import { Readme, OsInfo } from "./apps/Notes";

export const APPS = {
  about: { Component: About },
  projects: { Component: Projects, flush: true },
  experience: { Component: Experience },
  terminal: { Component: Terminal, dark: true, flush: true },
  resume: { Component: Resume, flush: true },
  certs: { Component: Certificates, flush: true },
  contact: { Component: Contact, flush: true },
  readme: { Component: Readme },
  osinfo: { Component: OsInfo },
  project: { Component: ProjectDetail, flush: true },
};

export function appTitle(app, props) {
  if (app === "project") return projects.find((p) => p.id === props?.id)?.name || "Project";
  if (app === "terminal") return "Terminal — reddy@os";
  return APP_META[app]?.title || app;
}

// Short name shown in the menu bar.
export function appName(app) {
  if (app === "project") return "Projects";
  return APP_META[app]?.title.replace(/\.\w+$/, "") || "Finder";
}

// What sits in the dock and on the desktop.
export const DOCK_APPS = ["about", "projects", "experience", "terminal", "certs", "contact", "resume"];
export const DESKTOP_ICONS = [
  { app: "about", label: "About Me" },
  { app: "projects", label: "Projects" },
  { app: "experience", label: "Experience" },
  { app: "terminal", label: "Terminal" },
  { app: "resume", label: "Résumé.pdf" },
  { app: "certs", label: "Certificates" },
  { app: "contact", label: "Contact" },
  { app: "readme", label: "Read me first.txt" },
];
export const LABELS = Object.fromEntries(DESKTOP_ICONS.map((d) => [d.app, d.label]));
