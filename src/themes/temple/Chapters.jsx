import {
  profile,
  socials,
  stats,
  experience,
  education,
  projects,
  featuredProjects,
  skills,
  certifications,
  photos,
} from "../../data/portfolio";
import { ArrowUpRightIcon, ArrowRightIcon, FileIcon, socialIcon } from "../../shell/icons";
import { ChapterMark, ProjectImage, ProjectLinks, Status, VerticalKanji, Words, ext } from "./parts";

export const CHAPTERS = [
  { id: "kage", n: 1, title: "Arrival", kanji: "影", romaji: "kage", meaning: "shadow", meta: "ALT 000 m · 23:41" },
  { id: "threshold", n: 2, title: "Threshold", kanji: "門", romaji: "mon", meaning: "gate", meta: "ALT 018 m · About" },
  { id: "path", n: 3, title: "Path", kanji: "道", romaji: "michi", meaning: "way", meta: "ALT 064 m · Experience" },
  { id: "craft", n: 4, title: "Craft", kanji: "工", romaji: "kō", meaning: "craft", meta: "ALT 121 m · Projects" },
  { id: "afterlight", n: 5, title: "Afterlight", kanji: "光", romaji: "hikari", meaning: "light", meta: "ALT 160 m · Skills" },
  { id: "garden", n: 6, title: "Contact", kanji: "庭", romaji: "niwa", meaning: "garden", meta: "ALT 172 m · Contact" },
];

function Chapter({ ch, children, className = "" }) {
  return (
    <section id={`tp-${ch.id}`} data-chapter={ch.n - 1} className={`tp-chapter ${className}`} aria-labelledby={`tp-h-${ch.id}`}>
      <VerticalKanji kanji={ch.kanji} romaji={ch.romaji} />
      <div className="tp-chapter-inner">{children}</div>
    </section>
  );
}

const idx = (i) => String(i + 1).padStart(2, "0");

export function Hero({ onJump }) {
  const ch = CHAPTERS[0];
  return (
    <Chapter ch={ch} className="tp-hero">
      <ChapterMark {...ch} />
      <h1 id="tp-h-kage" className="tp-hero-name tp-words" aria-label={profile.name}>
        <span className="tp-w" aria-hidden="true">
          <span className="tp-wi">{profile.firstName}</span>
        </span>{" "}
        <span className="tp-w" aria-hidden="true">
          <span className="tp-wi tp-italic">{profile.lastName}</span>
        </span>
      </h1>
      <p className="tp-hero-role" data-reveal>
        {profile.title} <span className="tp-accent">—</span> Backend · AI/ML · Full-stack
      </p>
      <p className="tp-hero-tag" data-reveal>
        {profile.tagline}
      </p>
      <div className="tp-hero-meta tp-mono" data-reveal>
        <span>{profile.location}</span>
        <span className="tp-sep" aria-hidden="true" />
        <span>
          <span className="tp-dot" aria-hidden="true" /> {profile.availability}
        </span>
      </div>
      <div className="tp-hero-cta" data-reveal>
        <button type="button" className="tp-btn tp-btn-solid" onClick={() => onJump(3)}>
          View the work <ArrowRightIcon size={16} />
        </button>
        <a className="tp-btn" href={profile.resume} {...ext}>
          <FileIcon size={16} /> Résumé
        </a>
      </div>
      <button type="button" className="tp-scrollcue tp-mono" onClick={() => onJump(1)}>
        <span className="tp-scrollcue-line" aria-hidden="true" />
        Scroll to ascend
      </button>
    </Chapter>
  );
}

export function Threshold() {
  const ch = CHAPTERS[1];
  return (
    <Chapter ch={ch}>
      <ChapterMark {...ch} />
      <Words as="h2" text="An engineer who builds for the long night." className="tp-h2" />
      <span id="tp-h-threshold" className="sr-only">
        About
      </span>
      <figure className="tp-scroll" data-reveal>
        <img src={photos.temple.scroll} alt={`Ink-wash portrait of ${profile.name} on a hanging scroll`} width="620" height="1100" loading="lazy" decoding="async" />
      </figure>
      <div className="tp-panel tp-prose">
        {profile.about.map((p, i) => (
          <p key={i} data-reveal className={i === 0 ? "tp-lede" : ""}>
            {p}
          </p>
        ))}
      </div>
      <div className="tp-edu tp-panel" data-reveal>
        <span className="tp-mono tp-label">Education</span>
        <div className="tp-edu-body">
          <strong>{education.degree}</strong>
          <span>{education.school}</span>
          <span className="tp-mono tp-dim">
            {education.start} — {education.end} · {education.score}
          </span>
        </div>
      </div>
      <dl className="tp-stats">
        {stats.map((s) => (
          <div className="tp-stat" key={s.label} data-reveal>
            <dt className="tp-mono">{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </Chapter>
  );
}

export function Path() {
  const ch = CHAPTERS[2];
  return (
    <Chapter ch={ch}>
      <ChapterMark {...ch} />
      <Words as="h2" text="The path so far." className="tp-h2" />
      <span id="tp-h-path" className="sr-only">
        Experience
      </span>
      <ol className="tp-exp">
        {experience.map((e, i) => (
          <li key={e.id} className="tp-exp-item tp-panel" data-reveal>
            <div className="tp-exp-side tp-mono">
              <span className="tp-exp-n">{idx(i)}</span>
              <span>
                {e.start} — {e.end}
              </span>
              <span className="tp-dim">{e.location}</span>
            </div>
            <div className="tp-exp-main">
              <h3 className="tp-h3">{e.role}</h3>
              <p className="tp-exp-co">
                {e.url ? (
                  <a href={e.url} {...ext} className="tp-inline">
                    {e.company} <ArrowUpRightIcon size={14} />
                  </a>
                ) : (
                  e.company
                )}
              </p>
              <p className="tp-exp-sum">{e.summary}</p>
              <ul className="tp-exp-hl">
                {e.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
              <ul className="tp-tech tp-mono" aria-label="Technologies">
                {e.tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}

export function Craft() {
  const ch = CHAPTERS[3];
  const rest = projects.filter((p) => !p.featured);
  return (
    <Chapter ch={ch}>
      <ChapterMark {...ch} />
      <Words as="h2" text="Things made by hand." className="tp-h2" />
      <span id="tp-h-craft" className="sr-only">
        Projects
      </span>
      <p className="tp-intro" data-reveal>
        {featuredProjects.length} featured works, then the full index — {projects.length} projects in all, each with its source.
      </p>
      <div className="tp-featured">
        {featuredProjects.map((p, i) => (
          <article key={p.id} className="tp-proj tp-panel" data-reveal>
            <div className="tp-proj-media">
              <ProjectImage project={p} index={i} />
            </div>
            <div className="tp-proj-body">
              <div className="tp-proj-top tp-mono">
                <span>04.{i + 1}</span>
                <span className="tp-dim">
                  {p.year} · {p.madeAt}
                </span>
                <Status status={p.status} />
              </div>
              <h3 className="tp-h3 tp-proj-name">{p.name}</h3>
              <p className="tp-proj-short">{p.short}</p>
              <p className="tp-proj-desc">{p.description}</p>
              <ul className="tp-tech tp-mono" aria-label="Technologies">
                {p.tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <ProjectLinks project={p} />
            </div>
          </article>
        ))}
      </div>

      <div className="tp-index tp-panel" data-reveal>
        <div className="tp-index-head">
          <h3 className="tp-h3">The index</h3>
          <span className="tp-mono tp-dim">{rest.length} more works</span>
        </div>
        <ul className="tp-index-list">
          {rest.map((p, i) => (
            <li key={p.id} className="tp-index-row">
              <span className="tp-mono tp-dim tp-index-n">{idx(i + featuredProjects.length)}</span>
              <div className="tp-index-main">
                <div className="tp-index-title">
                  <strong>{p.name}</strong>
                  {p.status !== "complete" && <Status status={p.status} />}
                </div>
                <p>{p.short}</p>
                <span className="tp-mono tp-dim tp-index-tech">
                  {p.year} · {p.tech.join(" · ")}
                </span>
              </div>
              <ProjectLinks project={p} />
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}

export function Afterlight() {
  const ch = CHAPTERS[4];
  return (
    <Chapter ch={ch}>
      <ChapterMark {...ch} />
      <Words as="h2" text="What remains, still glowing." className="tp-h2" />
      <span id="tp-h-afterlight" className="sr-only">
        Skills and certifications
      </span>
      <div className="tp-skills tp-panel" data-reveal>
        <h3 className="tp-mono tp-label">Instruments</h3>
        <dl>
          {skills.map((s) => (
            <div className="tp-skill-row" key={s.group}>
              <dt className="tp-mono">{s.group}</dt>
              <dd>
                {s.items.map((it, i) => (
                  <span key={it}>
                    {it}
                    {i < s.items.length - 1 && <span className="tp-skill-sep" aria-hidden="true"> / </span>}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="tp-certs tp-panel" data-reveal>
        <h3 className="tp-mono tp-label">Certifications</h3>
        <ul>
          {certifications.map((c) => (
            <li key={c.id} className="tp-cert">
              <span className="tp-mono tp-dim tp-cert-date">{c.date}</span>
              <div>
                <strong>{c.name}</strong>
                <span className="tp-cert-iss">
                  {c.issuer} · {c.note}
                </span>
              </div>
              {c.image ? (
                <a className="tp-link" href={c.image} {...ext} aria-label={`View ${c.name} certificate`}>
                  View <ArrowUpRightIcon size={14} />
                </a>
              ) : (
                <span className="tp-mono tp-dim tp-cert-na">On request</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}

export function Garden() {
  const ch = CHAPTERS[5];
  return (
    <footer id={`tp-${ch.id}`} data-chapter={5} className="tp-chapter tp-footer" aria-labelledby="tp-h-garden">
      <VerticalKanji kanji={ch.kanji} romaji={ch.romaji} />
      {/* the figure glimpsed at the top of the stairs, met at the summit */}
      <figure className="tp-hokage">
        <img
          className="tp-hokage-img"
          src={photos.temple.hokage}
          alt={`${profile.name} as the Hokage, standing at the summit in a flame-hemmed cloak`}
          width="900"
          height="1350"
          loading="lazy"
          decoding="async"
        />
      </figure>
      <div className="tp-chapter-inner">
        <ChapterMark {...ch} />
        <Words as="h2" text="Walk the rest of the way together." className="tp-h2 tp-h2-xl" />
        <span id="tp-h-garden" className="sr-only">
          Contact
        </span>
        <a className="tp-mail" href={`mailto:${profile.email}`} data-reveal>
          {profile.email} <ArrowUpRightIcon size={22} />
        </a>
        <ul className="tp-socials" data-reveal>
          {socials.map((s) => {
            const Icon = socialIcon[s.id];
            return (
              <li key={s.id}>
                <a href={s.url} {...(s.url.startsWith("mailto:") ? {} : ext)} className="tp-social">
                  {Icon && <Icon size={18} />}
                  <span>
                    <strong>{s.label}</strong>
                    <span className="tp-mono tp-dim">{s.handle}</span>
                  </span>
                </a>
              </li>
            );
          })}
          <li>
            <a href={profile.resume} {...ext} className="tp-social">
              <FileIcon size={18} />
              <span>
                <strong>Résumé</strong>
                <span className="tp-mono tp-dim">PDF · opens in new tab</span>
              </span>
            </a>
          </li>
        </ul>
        <p className="tp-manifesto" data-reveal>
          Build quietly. Ship carefully. Leave the path a little better lit than you found it.
        </p>
        <figure className="tp-epigraph" data-reveal>
          <blockquote lang="la">
            <span>Veni</span>
            <i aria-hidden="true" />
            <span>vidi</span>
            <i aria-hidden="true" />
            <span>vici</span>
            <span className="sr-only">.</span>
          </blockquote>
          <figcaption className="tp-mono">
            I came · I saw · I conquered <span className="tp-dim">— Julius Caesar, 47 BC</span>
          </figcaption>
        </figure>
        <div className="tp-credits tp-mono">
          <span>
            © {new Date().getFullYear()} {profile.name} · {profile.location}
          </span>
          <span>Inspired by Meng To&rsquo;s Kage. Original code — every shape procedurally generated.</span>
        </div>
      </div>
    </footer>
  );
}
