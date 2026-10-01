import { createContext, useContext, useEffect, useState } from "react";
import { GeneratedCover } from "./AppIcon";

// openApp(app, props?, originEl?) works on both the desktop and the phone shell.
export const OsContext = createContext({ openApp: () => {}, mobile: false });
export const useOs = () => useContext(OsContext);

export const EXT = { target: "_blank", rel: "noopener noreferrer" };

export const CATEGORY_LABEL = { ai: "AI", fullstack: "Full-stack", ml: "ML", frontend: "Frontend" };

export function StatusBadge({ status }) {
  if (status === "live")
    return (
      <span className="os-badge os-badge--live">
        <i aria-hidden="true" /> Live
      </span>
    );
  if (status === "in-progress") return <span className="os-badge os-badge--wip">In progress</span>;
  return <span className="os-badge">Complete</span>;
}

export function ProjectThumb({ project, compact = false, lazy = true }) {
  const [failed, setFailed] = useState(!project.image);
  if (failed) return <GeneratedCover project={project} compact={compact} />;
  return (
    <img
      className="os-thumb-img"
      src={project.image}
      alt={`${project.name} screenshot`}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useMediaQuery(query) {
  const get = () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

const fmtCache = {};
export function formatIST(date, opts) {
  const key = JSON.stringify(opts);
  if (!fmtCache[key]) fmtCache[key] = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts });
  return fmtCache[key].format(date);
}

// Ticks on the minute boundary.
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let t;
    const tick = () => {
      setNow(new Date());
      t = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    t = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    return () => clearTimeout(t);
  }, []);
  return now;
}
