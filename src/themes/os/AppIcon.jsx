import { useId } from "react";

// Hand-drawn app icons for Reddy OS. Each is a 64x64 squircle tile with its own glyph.
const TILES = {
  about: ["#8b5cf6", "#ec4899"],
  projects: ["#38bdf8", "#2563eb"],
  experience: ["#fbbf24", "#ea580c"],
  terminal: ["#1f2433", "#0b0d14"],
  resume: ["#ffffff", "#e5e7eb"],
  certs: ["#2dd4bf", "#0f766e"],
  photos: ["#fdf2f8", "#e0e7ff"],
  contact: ["#60a5fa", "#4f46e5"],
  readme: ["#fef3c7", "#fde68a"],
  osinfo: ["#312e81", "#0f766e"],
};

function Glyph({ app, gid }) {
  switch (app) {
    case "about":
      return (
        <g>
          <circle cx="32" cy="25" r="9" fill="#fff" />
          <path d="M15 49c2.5-9 9-13.5 17-13.5S46.5 40 49 49c-5 3.5-11 5-17 5s-12-1.5-17-5z" fill="#fff" />
        </g>
      );
    case "projects":
      return (
        <g>
          <path d="M12 21a4 4 0 014-4h10l5 5h17a4 4 0 014 4v3H12z" fill="#bfe6ff" />
          <rect x="12" y="25" width="40" height="24" rx="4" fill="#fff" />
          <rect x="18" y="31" width="14" height="3" rx="1.5" fill="#60a5fa" />
          <rect x="18" y="37" width="22" height="3" rx="1.5" fill="#bfdbfe" />
        </g>
      );
    case "experience":
      return (
        <g>
          <path d="M25 22v-3a3 3 0 013-3h8a3 3 0 013 3v3" stroke="#fff" strokeWidth="3.5" fill="none" />
          <rect x="12" y="22" width="40" height="27" rx="5" fill="#fff" />
          <path d="M12 33c6 3 13 4.5 20 4.5S46 36 52 33" stroke="#fdba74" strokeWidth="3" fill="none" />
          <rect x="28.5" y="33" width="7" height="7" rx="2" fill="#ea580c" />
        </g>
      );
    case "terminal":
      return (
        <g>
          <rect x="9" y="12" width="46" height="40" rx="6" fill="none" stroke="#3b4256" strokeWidth="1.5" />
          <path d="M18 26l8 6-8 6" stroke="#5eead4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="30" y="37" width="14" height="3.5" rx="1.75" fill="#a5b4fc" />
        </g>
      );
    case "resume":
      return (
        <g>
          <path d="M18 9h20l10 10v34a3 3 0 01-3 3H18a3 3 0 01-3-3V12a3 3 0 013-3z" fill="#fff" stroke="#d1d5db" />
          <path d="M38 9v8a2 2 0 002 2h8" fill="#e5e7eb" />
          <rect x="21" y="25" width="16" height="2.5" rx="1.25" fill="#9ca3af" />
          <rect x="21" y="30" width="22" height="2.5" rx="1.25" fill="#d1d5db" />
          <rect x="21" y="35" width="19" height="2.5" rx="1.25" fill="#d1d5db" />
          <rect x="13" y="41" width="26" height="11" rx="2.5" fill="#e11d48" />
          <text x="26" y="49.6" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily="Inter, Arial, sans-serif">PDF</text>
        </g>
      );
    case "certs":
      return (
        <g>
          <path d="M24 36l-5 16 7-3 4 6 4-13z" fill="#ccfbf1" />
          <path d="M40 36l5 16-7-3-4 6-4-13z" fill="#99f6e4" />
          <circle cx="32" cy="27" r="14" fill="#fff" />
          <circle cx="32" cy="27" r="9" fill="none" stroke="#14b8a6" strokeWidth="2.5" />
          <path d="M32 21.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.5z" fill="#f59e0b" />
        </g>
      );
    case "photos":
      return (
        <g>
          {[
            ["#f43f5e", 0],
            ["#f59e0b", 45],
            ["#eab308", 90],
            ["#22c55e", 135],
            ["#14b8a6", 180],
            ["#3b82f6", 225],
            ["#8b5cf6", 270],
            ["#ec4899", 315],
          ].map(([c, r]) => (
            <ellipse key={r} cx="32" cy="20" rx="6.5" ry="11" fill={c} opacity=".85" transform={`rotate(${r} 32 32)`} />
          ))}
        </g>
      );
    case "contact":
      return (
        <g>
          <rect x="11" y="17" width="42" height="30" rx="5" fill="#fff" />
          <path d="M13 20l19 14 19-14" stroke="#818cf8" strokeWidth="3" fill="none" strokeLinejoin="round" />
          <circle cx="50" cy="17" r="7" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
        </g>
      );
    case "readme":
      return (
        <g>
          <rect x="14" y="10" width="36" height="44" rx="4" fill="#fffbeb" stroke="#f59e0b" strokeOpacity=".5" />
          <rect x="14" y="10" width="36" height="8" rx="4" fill="#f59e0b" />
          {[24, 30, 36, 42].map((y, i) => (
            <rect key={y} x="19" y={y} width={i === 3 ? 15 : 26} height="2.5" rx="1.25" fill="#a16207" opacity=".55" />
          ))}
        </g>
      );
    case "osinfo":
      return <OsMarkGlyph gid={gid} />;
    default:
      return null;
  }
}

function OsMarkGlyph({ gid }) {
  return (
    <g>
      <circle cx="32" cy="32" r="17" fill="none" stroke={`url(#${gid}-m)`} strokeWidth="5" />
      <path d="M27 42V22h7.5a6 6 0 010 12H27m7 0l6 8" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function AppIcon({ app, size = 56, className = "" }) {
  const gid = useId().replace(/:/g, "");
  const [a, b] = TILES[app] || TILES.osinfo;
  return (
    <svg className={`os-appicon ${className}`} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`${gid}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient id={`${gid}-gl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#${gid}-bg)`} />
      <Glyph app={app} gid={gid} />
      <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#${gid}-gl)`} />
      <rect x="2.5" y="2.5" width="59" height="59" rx="14.5" fill="none" stroke="#fff" strokeOpacity=".22" />
    </svg>
  );
}

// The Reddy OS logo mark, used in the menu bar and boot screen.
export function OsLogo({ size = 18, className = "" }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`${gid}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#5eead4" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="none" stroke={`url(#${gid}-m)`} strokeWidth="7" />
      <path d="M24 46V18h11a9 9 0 010 18H24m10.5 0l9 10" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Deterministic, app-icon-style cover for projects whose screenshot is missing.
const PALETTES = [
  ["#6366f1", "#14b8a6"],
  ["#f43f5e", "#f59e0b"],
  ["#0ea5e9", "#6366f1"],
  ["#10b981", "#0ea5e9"],
  ["#a855f7", "#ec4899"],
  ["#f97316", "#e11d48"],
  ["#14b8a6", "#84cc16"],
  ["#3b82f6", "#a855f7"],
];

export function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initials(name) {
  const clean = name.split(/[—–-]/)[0].trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2);
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function GeneratedCover({ project, compact = false }) {
  const [a, b] = PALETTES[hashStr(project.id) % PALETTES.length];
  return (
    <div
      className={`os-gencover${compact ? " is-compact" : ""}`}
      style={{ "--ga": a, "--gb": b }}
      role="img"
      aria-label={`${project.name} cover`}
    >
      <span className="os-gencover-tile">{initials(project.name)}</span>
      {!compact && <span className="os-gencover-tech">{project.tech.slice(0, 3).join(" · ")}</span>}
    </div>
  );
}
