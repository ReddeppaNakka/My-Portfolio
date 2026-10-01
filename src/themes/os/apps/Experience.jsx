import { experience, education } from "../../../data/portfolio";
import { ArrowUpRightIcon } from "../../../shell/icons";
import { EXT } from "../common";

export default function Experience() {
  return (
    <div className="os-app os-exp">
      <header className="os-exp-head">
        <p className="os-eyebrow">Work history</p>
        <h1 className="os-h1">Experience</h1>
      </header>
      <ol className="os-timeline">
        {experience.map((e, i) => (
          <li key={e.id} className="os-tl-item">
            <span className={`os-tl-dot${i === 0 ? " is-current" : ""}`} aria-hidden="true" />
            <div className="os-tl-when">
              {e.start} – {e.end}
              <span>{e.location}</span>
            </div>
            <div className="os-card os-tl-card">
              <h2 className="os-tl-role">{e.role}</h2>
              <p className="os-tl-co">
                {e.url ? (
                  <a href={e.url} {...EXT}>
                    {e.company} <ArrowUpRightIcon size={13} />
                  </a>
                ) : (
                  e.company
                )}
              </p>
              <p className="os-p">{e.summary}</p>
              <ul className="os-tl-list">
                {e.highlights.map((h) => (
                  <li key={h.slice(0, 30)}>{h}</li>
                ))}
              </ul>
              <ul className="os-chips" aria-label="Technologies">
                {e.tech.map((t) => (
                  <li key={t} className="os-chip">{t}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
        <li className="os-tl-item">
          <span className="os-tl-dot is-edu" aria-hidden="true" />
          <div className="os-tl-when">
            {education.start} – {education.end}
            <span>Education</span>
          </div>
          <div className="os-card os-tl-card">
            <h2 className="os-tl-role">{education.degree}</h2>
            <p className="os-tl-co">{education.school}</p>
            <ul className="os-chips">
              <li className="os-chip">{education.score}</li>
            </ul>
          </div>
        </li>
      </ol>
    </div>
  );
}
