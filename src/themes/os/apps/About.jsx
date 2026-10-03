import { profile, socials, stats, education, skills, photos } from "../../../data/portfolio";
import { socialIcon, FileIcon, MailIcon } from "../../../shell/icons";
import { EXT, useOs } from "../common";

export default function About() {
  const { openApp } = useOs();
  return (
    <div className="os-app os-about">
      <header className="os-about-hero">
        <div className="os-about-photo">
          <img src={photos.os.portrait} alt={`Portrait of ${profile.name}`} width="112" height="112" />
        </div>
        <div className="os-about-id">
          <p className="os-eyebrow">{profile.availability}</p>
          <h1 className="os-about-name">{profile.name}</h1>
          <p className="os-about-title">
            {profile.title} <span aria-hidden="true">·</span> {profile.role}
          </p>
          <p className="os-about-loc">{profile.location}</p>
        </div>
      </header>

      <p className="os-about-tagline">{profile.tagline}</p>

      <div className="os-btnrow">
        <button type="button" className="os-btn os-btn--primary" onClick={(e) => openApp("resume", {}, e.currentTarget)}>
          <FileIcon size={16} /> View résumé
        </button>
        <button type="button" className="os-btn" onClick={(e) => openApp("contact", {}, e.currentTarget)}>
          <MailIcon size={16} /> Contact
        </button>
        <button type="button" className="os-btn" onClick={(e) => openApp("projects", {}, e.currentTarget)}>
          Browse projects
        </button>
      </div>

      <ul className="os-stats" aria-label="At a glance">
        {stats.map((s) => (
          <li key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>

      <section className="os-sec" aria-labelledby="os-about-h">
        <h2 id="os-about-h" className="os-h2">About</h2>
        {profile.about.map((p) => (
          <p key={p.slice(0, 24)} className="os-p">{p}</p>
        ))}
      </section>

      <section className="os-sec" aria-labelledby="os-edu-h">
        <h2 id="os-edu-h" className="os-h2">Education</h2>
        <div className="os-card os-edu">
          <div>
            <strong>{education.degree}</strong>
            <span>{education.school}</span>
          </div>
          <div className="os-edu-meta">
            <span>{education.start} – {education.end}</span>
            <span className="os-chip">{education.score}</span>
          </div>
        </div>
      </section>

      <section className="os-sec" aria-labelledby="os-skills-h">
        <h2 id="os-skills-h" className="os-h2">Skills</h2>
        <dl className="os-skills">
          {skills.map((g) => (
            <div key={g.group}>
              <dt>{g.group}</dt>
              <dd>
                {g.items.map((s) => (
                  <span key={s} className="os-chip">{s}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="os-about-socials">
        {socials.map((s) => {
          const Icon = socialIcon[s.id];
          return (
            <a key={s.id} href={s.url} className="os-social" {...(s.id === "email" ? {} : EXT)}>
              {Icon && <Icon size={16} />}
              <span>{s.label}</span>
            </a>
          );
        })}
      </footer>
    </div>
  );
}
