import { useState } from "react";
import { profile, socials, stats, experience, featuredProjects, skills, photos } from "../../data/portfolio";
import { socialIcon, ArrowUpRightIcon, MailIcon, FileIcon, GitHubIcon } from "../../shell/icons";
import { Clock, Cover, Marquee, StatusSticker, ext, useTilt } from "./parts";

const STAT_FILLS = ["", "yellow", "", "blue"];

// Polaroid that flips from a work-mode portrait to an off-duty photo on click/tap.
function PhotoFlip({ where }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <figure className="bt-tile bt-photo">
      <button
        type="button"
        className={`bt-photo-frame bt-flip${flipped ? " is-flipped" : ""}`}
        aria-pressed={flipped}
        aria-label={flipped ? "Show professional photo" : "Flip to see an off-duty photo"}
        onClick={() => setFlipped((v) => !v)}
      >
        <span className="bt-flip-inner">
          <img className="bt-flip-face" src={photos.bento.headshot} alt={`Portrait of ${profile.name} at a studio desk, arms crossed`} width="800" height="862" />
          <img className="bt-flip-face bt-flip-back" src={photos.bento.fun} alt={`${profile.name} laughing with a coffee, off duty`} width="800" height="862" loading="lazy" />
        </span>
      </button>
      <figcaption className="bt-sticker bt-sticker--place">📍 {where}</figcaption>
      <span className="bt-sticker bt-sticker--flip" aria-hidden="true">
        {flipped ? "← back to work" : "click to flip ↻"}
      </span>
    </figure>
  );
}

function FeaturedTile({ project, index, reduced }) {
  const tiltRef = useTilt(reduced);
  const href = project.live || project.github;
  return (
    <article ref={tiltRef} className={`bt-tile bt-feat bt-feat-${index + 1} bt-press`} data-cursor={project.live ? "LIVE ↗" : "CODE ↗"}>
      <Cover project={project} index={index} eager={index < 2} />
      <div className="bt-feat-body">
        <div className="bt-feat-top">
          <span className="bt-label">{String(index + 1).padStart(2, "0")} · {project.year}</span>
          <StatusSticker status={project.status} />
        </div>
        <h3 className="bt-feat-name">
          <a className="bt-stretch" href={href} {...ext}>
            {project.name}
          </a>
        </h3>
        <p className="bt-feat-short">{project.short}</p>
        <div className="bt-feat-foot">
          <span className="bt-feat-tech">{project.tech.slice(0, 3).join(" · ")}</span>
          <span className="bt-arrow" aria-hidden="true">
            <ArrowUpRightIcon size={18} />
          </span>
        </div>
      </div>
      {project.live && (
        <a className="bt-feat-gh" href={project.github} {...ext} aria-label={`${project.name} source on GitHub`}>
          <GitHubIcon size={16} />
        </a>
      )}
    </article>
  );
}

export default function Hero({ reduced }) {
  const latest = experience[0];
  const allSkills = skills.flatMap((g) => g.items);
  const where = profile.location.replace(/India$/, "IN");

  return (
    <section className="bt-section bt-hero" id="about" aria-labelledby="bt-hi">
      <div className="bt-grid">
        <div className="bt-tile bt-intro">
          <span className="bt-sticker bt-sticker--otw" aria-hidden="true">Open to work ✦</span>
          <p className="bt-label">{profile.title} — Portfolio ’{String(new Date().getFullYear()).slice(2)}</p>
          <h1 id="bt-hi" className="bt-hi">
            Hi, I’m <mark>{profile.nickname}.</mark>
          </h1>
          <p className="bt-intro-name">
            <strong>{profile.name}</strong> — {profile.title} · {profile.role}
          </p>
          <p className="bt-intro-tag">{profile.tagline}</p>
          <div className="bt-intro-cta">
            <a className="bt-btn bt-btn--yellow" href={`mailto:${profile.email}`}>
              <MailIcon size={18} /> Email me
            </a>
            <a className="bt-btn" href={profile.resume} {...ext}>
              <FileIcon size={18} /> Résumé <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <PhotoFlip where={where} />

        <div className="bt-tile bt-avail bt-fill-mint">
          <div className="bt-label">Status</div>
          <p className="bt-avail-text">
            <span className="bt-pulse" aria-hidden="true" />
            {profile.availability}
          </p>
          <p className="bt-avail-sub">Backend · AI/ML · Full-stack</p>
        </div>

        <div className="bt-tile bt-clock-tile">
          <Clock />
        </div>

        {stats.map((s, i) => (
          <div key={s.label} className={`bt-tile bt-stat${STAT_FILLS[i] ? ` bt-fill-${STAT_FILLS[i]}` : ""}`}>
            <span className="bt-stat-num">{s.value}</span>
            <span className="bt-stat-label">{s.label}</span>
          </div>
        ))}

        <a className="bt-tile bt-role bt-press" href="#experience">
          <div className="bt-role-top">
            <span className="bt-label">Latest role</span>
            <span className="bt-chip bt-chip--sm">{latest.start} – {latest.end}</span>
          </div>
          <p className="bt-role-title">{latest.role}</p>
          <p className="bt-role-co">@ {latest.company}</p>
          <p className="bt-role-sum">{latest.summary}</p>
          <span className="bt-role-more">
            Full experience <ArrowUpRightIcon size={16} />
          </span>
        </a>

        <div className="bt-tile bt-mq-tile bt-fill-ink" role="group" aria-label="Skills">
          <Marquee items={allSkills} reduced={reduced} />
        </div>

        <div className="bt-tile bt-about">
          <div className="bt-label">About</div>
          {profile.about.map((p, i) => (
            <p key={i} className={i === 0 ? "bt-about-lead" : undefined}>
              {p}
            </p>
          ))}
        </div>

        <div className="bt-tile bt-socials bt-fill-lilac">
          <div className="bt-label">Find me</div>
          <ul>
            {socials.map((s) => {
              const Icon = socialIcon[s.id];
              const isMail = s.id === "email";
              return (
                <li key={s.id}>
                  <a className="bt-social" href={s.url} {...(isMail ? {} : ext)}>
                    <span className="bt-social-ico">
                      <Icon size={20} />
                    </span>
                    <span className="bt-social-txt">
                      <strong>{s.label}</strong>
                      <span>{s.handle}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bt-tile bt-feat-head bt-fill-coral">
          <h2 className="bt-feat-h">Selected work</h2>
          <a className="bt-btn bt-btn--sm" href="#work">
            All projects <span aria-hidden="true">↓</span>
          </a>
        </div>

        {featuredProjects.map((p, i) => (
          <FeaturedTile key={p.id} project={p} index={i} reduced={reduced} />
        ))}
      </div>
    </section>
  );
}
