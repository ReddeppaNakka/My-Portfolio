import { Fragment, useState } from "react";
import { ArrowUpRightIcon, GitHubIcon } from "../../shell/icons";

export const ext = { target: "_blank", rel: "noopener noreferrer" };

// Heading whose words rise one by one (animated in useReveal).
export function Words({ text, as: Tag = "h2", className = "" }) {
  const words = text.split(" ");
  return (
    <Tag className={`tp-words ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="tp-w" aria-hidden="true">
            <span className="tp-wi">{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

export function ChapterMark({ n, kanji, romaji, meaning, meta }) {
  return (
    <div className="tp-mark" data-reveal>
      <span className="tp-mono tp-mark-n">
        {String(n).padStart(2, "0")} <span className="tp-dim">/ 06</span>
      </span>
      <span className="tp-mark-rule" aria-hidden="true" />
      <span className="tp-mono tp-mark-label">
        <span lang="ja">{kanji}</span> {romaji} — {meaning}
      </span>
      {meta && <span className="tp-mono tp-mark-meta">{meta}</span>}
    </div>
  );
}

export function VerticalKanji({ kanji, romaji }) {
  return (
    <div className="tp-kanji" aria-hidden="true">
      <div className="tp-kanji-inner">
        <span className="tp-kanji-char" lang="ja">
          {kanji}
        </span>
        <span className="tp-kanji-seal">{romaji}</span>
      </div>
    </div>
  );
}

export function Status({ status }) {
  if (status === "live")
    return (
      <span className="tp-status tp-status-live">
        <span className="tp-dot" aria-hidden="true" />
        Live
      </span>
    );
  if (status === "in-progress") return <span className="tp-status tp-status-wip">In progress</span>;
  return <span className="tp-status">Complete</span>;
}

// On-theme generated cover: initials, a moon, ripples, the tech stack.
export function Cover({ project, index }) {
  const initials = project.name
    .replace(/[—–-].*$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const hue = [12, 22, 4, 30, 16, 8][index % 6];
  return (
    <div className="tp-cover" style={{ "--tp-hue": hue }} role="img" aria-label={`${project.name} cover`}>
      <span className="tp-cover-moon" aria-hidden="true" />
      <span className="tp-cover-waves" aria-hidden="true" />
      <span className="tp-cover-initials" aria-hidden="true">
        {initials}
      </span>
      <span className="tp-cover-tech tp-mono" aria-hidden="true">
        {project.tech.slice(0, 3).join(" · ")}
      </span>
    </div>
  );
}

export function ProjectImage({ project, index, eager = false }) {
  const [failed, setFailed] = useState(!project.image);
  if (failed) return <Cover project={project} index={index} />;
  return (
    <img
      src={project.image}
      alt={`Screenshot of ${project.name}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function ProjectLinks({ project }) {
  return (
    <div className="tp-links">
      {project.github && (
        <a className="tp-link" href={project.github} {...ext} aria-label={`${project.name} source on GitHub`}>
          <GitHubIcon size={15} /> Code
        </a>
      )}
      {project.live && (
        <a className="tp-link tp-link-accent" href={project.live} {...ext} aria-label={`${project.name} live site`}>
          Live <ArrowUpRightIcon size={15} />
        </a>
      )}
      {project.extraLinks?.map((l) => (
        <a className="tp-link" key={l.url} href={l.url} {...ext}>
          {l.label} <ArrowUpRightIcon size={15} />
        </a>
      ))}
    </div>
  );
}
