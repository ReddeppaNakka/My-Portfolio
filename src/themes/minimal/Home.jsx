import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  profile,
  socials,
  stats,
  experience,
  education,
  projects,
  featuredProjects,
  certifications,
} from "../../data/portfolio";
import { socialIcon, ArrowUpRightIcon, ArrowRightIcon, GitHubIcon, ExternalIcon } from "../../shell/icons";
import { ext, hostname, Pills, StatusBadge, Thumb } from "./parts";

const NAV = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
];

/* ---------- hooks ---------- */

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const visible = new Map();
    const pick = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (nearBottom) return setActive(ids[ids.length - 1]);
      const first = ids.find((id) => visible.get(id));
      if (first) setActive(first);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        pick();
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    window.addEventListener("scroll", pick, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", pick);
    };
  }, [ids]);
  return active;
}

// One-time fade/slide-in for sections. Content stays visible if JS or IO is unavailable.
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const items = [...root.querySelectorAll(".m-reveal")];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    root.classList.add("m-anim");
    items.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("m-anim");
      items.forEach((el) => el.classList.remove("is-in"));
    };
  }, [rootRef]);
}

/* ---------- About: highlight companies and projects inline ---------- */

const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
const projectUrl = (p) => (p ? p.live || p.github : null);
const companyShort = (c) => c.replace(/\s+(4X\s+)?Pvt Ltd$/i, "");

const HIGHLIGHTS = [
  ...experience.map((e) => ({ text: companyShort(e.company), url: e.url })),
  { text: education.short, url: null },
  { text: "AI task platform", url: projectUrl(byId["befach-tasks"]) },
  { text: "agentic travel recommender", url: projectUrl(byId.atlas) },
  { text: "daily intelligence pipeline", url: projectUrl(byId.newsfall) },
  { text: "interactive DSA platform", url: projectUrl(byId.algorithmix) },
  { text: "fully local voice agent", url: projectUrl(byId.nova) },
];
const HL_RE = new RegExp(
  `(${HIGHLIGHTS.map((h) => h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g"
);

function Rich({ text }) {
  return text.split(HL_RE).map((part, i) => {
    const hit = HIGHLIGHTS.find((h) => h.text === part);
    if (!hit) return <Fragment key={i}>{part}</Fragment>;
    return hit.url ? (
      <a key={i} className="m-hl m-hl--link" href={hit.url} {...ext}>
        {part}
      </a>
    ) : (
      <strong key={i} className="m-hl">
        {part}
      </strong>
    );
  });
}

/* ---------- sections ---------- */

function Section({ id, title, children }) {
  return (
    <section id={id} className="m-section" aria-labelledby={`${id}-h`}>
      <div className="m-section__head">
        <h2 id={`${id}-h`} className="m-section__title">
          {title}
        </h2>
      </div>
      <div className="m-reveal">{children}</div>
    </section>
  );
}

function About() {
  return (
    <Section id="about" title="About">
      <div className="m-about">
        {profile.about.map((p, i) => (
          <p key={i}>
            <Rich text={p} />
          </p>
        ))}
        <p className="m-edu">
          <span className="m-label">Education</span>
          <span>
            {education.degree}, <span className="m-strong">{education.school}</span> ·{" "}
            {education.start}–{education.end} · {education.score}
          </span>
        </p>
        <dl className="m-stats">
          {stats.map((s) => (
            <div key={s.label} className="m-stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="m-list">
        {experience.map((job) => {
          const Title = job.url ? "a" : "span";
          const titleProps = job.url
            ? { href: job.url, ...ext, "aria-label": `${job.role} at ${job.company} (opens in new tab)` }
            : {};
          return (
            <li key={job.id} className="m-card">
              <p className="m-card__date" aria-label={`${job.start} to ${job.end}`}>
                <span className="m-nowrap">{job.start} —</span>{" "}<span className="m-nowrap">{job.end}</span>
              </p>
              <div className="m-card__body">
                <h3 className="m-card__title">
                  <Title className="m-card__link" {...titleProps}>
                    {job.url && <span className="m-card__hit" aria-hidden="true" />}
                    <span>
                      {job.role} · <span className="m-nowrap">{companyShort(job.company)}</span>
                      {job.url && <ArrowUpRightIcon size={15} className="m-arrow" />}
                    </span>
                  </Title>
                </h3>
                <p className="m-card__meta">{job.location}</p>
                <p className="m-card__text">{job.summary}</p>
                <ul className="m-points">
                  {job.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                <Pills items={job.tech} />
              </div>
            </li>
          );
        })}
      </ol>
      <a className="m-more" href={profile.resume} {...ext}>
        View Full Résumé <ArrowUpRightIcon size={15} className="m-arrow" />
      </a>
    </Section>
  );
}

function ProjectLinks({ project }) {
  const links = [
    project.github && { label: "GitHub", url: project.github, Icon: GitHubIcon },
    project.live && { label: hostname(project.live), url: project.live, Icon: ExternalIcon },
    ...(project.extraLinks || []).map((l) => ({ label: l.label, url: l.url, Icon: GitHubIcon })),
  ].filter(Boolean);
  return (
    <ul className="m-links" aria-label={`${project.name} links`}>
      {links.map(({ label, url, Icon }) => (
        <li key={url}>
          <a href={url} {...ext}>
            <Icon size={14} />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Projects() {
  const location = useLocation();
  return (
    <Section id="projects" title="Projects">
      <ul className="m-list">
        {featuredProjects.map((p) => {
          const href = p.live || p.github;
          return (
            <li key={p.id} className="m-card m-card--project">
              <div className="m-thumb">
                <Thumb project={p} />
              </div>
              <div className="m-card__body">
                <h3 className="m-card__title">
                  <a className="m-card__link" href={href} {...ext}>
                    <span className="m-card__hit" aria-hidden="true" />
                    <span>
                      {p.name}
                      <ArrowUpRightIcon size={15} className="m-arrow" />
                    </span>
                  </a>
                  <StatusBadge status={p.status} />
                </h3>
                <p className="m-card__text">{p.description}</p>
                <Pills items={p.tech} />
                <ProjectLinks project={p} />
              </div>
            </li>
          );
        })}
      </ul>
      <Link className="m-more" to={{ pathname: "/archive", search: location.search }}>
        View Full Project Archive <ArrowRightIcon size={15} className="m-arrow m-arrow--right" />
      </Link>
    </Section>
  );
}

function Certifications() {
  return (
    <Section id="certifications" title="Certifications">
      <ul className="m-certs">
        {certifications.map((c) => (
          <li key={c.id} className="m-cert">
            {c.image ? (
              <a
                className="m-cert__img"
                href={c.image}
                {...ext}
                aria-label={`Open ${c.name} certificate image in a new tab`}
              >
                <img src={c.image} alt="" loading="lazy" decoding="async" width="72" height="50" />
              </a>
            ) : (
              <span className="m-cert__img m-cert__img--empty" aria-hidden="true">
                {c.issuer.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="m-cert__body">
              <h3 className="m-cert__name">{c.name}</h3>
              <p className="m-cert__meta">
                {c.issuer} · {c.date}
              </p>
              <p className="m-cert__note">{c.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- page ---------- */

function Header({ active }) {
  return (
    <header className="m-side">
      <div>
        <h1 className="m-name">
          <a href="#top">{profile.name}</a>
        </h1>
        <p className="m-role">{profile.title}</p>
        <p className="m-tagline">{profile.tagline}</p>
        <p className="m-avail">
          <span className="m-avail__dot" aria-hidden="true" />
          {profile.availability} · {profile.location}
        </p>
        <nav className="m-nav" aria-label="In-page">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className={active === n.id ? "is-active" : undefined}
                  aria-current={active === n.id ? "location" : undefined}
                >
                  <span className="m-nav__line" aria-hidden="true" />
                  <span className="m-nav__text">{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="m-side__foot">
        <ul className="m-socials" aria-label="Social links">
          {socials.map((s) => {
            const Icon = socialIcon[s.id];
            return (
              <li key={s.id}>
                <a href={s.url} {...ext} aria-label={`${s.label} (opens in new tab)`} title={s.handle}>
                  {Icon ? <Icon size={22} /> : s.label}
                </a>
              </li>
            );
          })}
        </ul>
        <a className="m-resume" href={profile.resume} {...ext}>
          Résumé <ArrowUpRightIcon size={14} className="m-arrow" />
        </a>
      </div>
    </header>
  );
}

const NAV_IDS = NAV.map((n) => n.id);

export default function Home() {
  const active = useActiveSection(NAV_IDS);
  const mainRef = useRef(null);
  useReveal(mainRef);

  return (
    <div className="m-wrap" id="top">
      <div className="m-layout">
        <Header active={active} />
        <main id="m-content" className="m-main" ref={mainRef} tabIndex={-1}>
          <About />
          <Experience />
          <Projects />
          <Certifications />
          <footer className="m-footer">
            <p>
              Designed &amp; built by {profile.name} with React and Vite. Layout inspired by Brittany
              Chiang.
            </p>
            <p>Switch design (bottom-right) to see three more takes.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
