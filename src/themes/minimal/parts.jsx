import { useEffect, useState } from "react";

export const ext = { target: "_blank", rel: "noopener noreferrer" };

export const hostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function Pills({ items, label = "Technologies used" }) {
  return (
    <ul className="m-pills" aria-label={label}>
      {items.map((t) => (
        <li key={t} className="m-pill">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function StatusBadge({ status }) {
  if (status === "live")
    return (
      <span className="m-badge m-badge--live">
        <span className="m-badge__dot" aria-hidden="true" />
        Live
      </span>
    );
  if (status === "in-progress")
    return <span className="m-badge m-badge--wip">In progress</span>;
  return null;
}

const initials = (name) =>
  name
    .split(/[\s—-]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const hue = (id) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

// Generated cover used whenever a project image is missing or fails to load.
export function Cover({ project }) {
  const h = hue(project.id);
  return (
    <div
      className="m-cover"
      style={{ "--h1": `${h}`, "--h2": `${(h + 40) % 360}` }}
      role="img"
      aria-label={`${project.name} cover`}
    >
      <span className="m-cover__mono">{initials(project.name)}</span>
      <span className="m-cover__tech">{project.tech.slice(0, 2).join(" · ")}</span>
    </div>
  );
}

export function Thumb({ project }) {
  const [failed, setFailed] = useState(!project.image);
  useEffect(() => setFailed(!project.image), [project.image]);
  if (failed) return <Cover project={project} />;
  return (
    <img
      className="m-thumb__img"
      src={project.image}
      alt={`Screenshot of ${project.name}`}
      loading="lazy"
      decoding="async"
      width="200"
      height="125"
      onError={() => setFailed(true)}
    />
  );
}
