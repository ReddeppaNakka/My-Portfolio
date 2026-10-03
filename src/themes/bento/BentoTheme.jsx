import { useEffect, useState } from "react";
import { profile, socials, experience, education, skills, certifications, photos } from "../../data/portfolio";
import { socialIcon, ArrowUpRightIcon } from "../../shell/icons";
import { useFonts } from "../../shell/useFonts";
import Hero from "./Hero";
import Work from "./Work";
import { CopyEmail, FILLS, ext, initials, usePrefersReducedMotion } from "./parts";
import { useFollowCursor } from "../../shell/useFollowCursor";
import "./bento.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

const EXP_FILLS = ["yellow", "blue", "mint"];
const SKILL_FILLS = ["yellow", "coral", "blue", "mint", "lilac", "yellow"];

// Sticker that rides along with the (custom, CSS) arrow over project tiles.
function Cursor() {
  const { enabled, dot, ring } = useFollowCursor({ lag: 0.24, primary: ".bt-stretch" });
  if (!enabled) return null;
  return (
    <>
      <span ref={ring} className="bt-cursor-sticker" aria-hidden="true" />
      <span ref={dot} className="bt-cursor-dot" aria-hidden="true" />
    </>
  );
}

function TopBar() {
  return (
    <header className="bt-top">
      <div className="bt-top-in">
        <a className="bt-logo" href="#about" aria-label={`${profile.name} — home`}>
          RN
        </a>
        <nav aria-label="Primary">
          <ul className="bt-nav">
            {NAV.map((n) => (
              <li key={n.href}>
                <a className="bt-navchip" href={n.href}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="bt-btn bt-btn--sm bt-btn--yellow bt-top-cv" href={profile.resume} {...ext}>
          Résumé <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}

function Experience() {
  return (
    <section className="bt-section" id="experience" aria-labelledby="bt-exp-h">
      <div className="bt-sec-head">
        <div>
          <p className="bt-label">03 / Experience</p>
          <h2 id="bt-exp-h" className="bt-h2">
            Where I’ve <span className="bt-hl bt-fill-yellow">shipped.</span>
          </h2>
        </div>
      </div>
      <ol className="bt-exp">
        {experience.map((e, i) => (
          <li key={e.id} className="bt-tile bt-job">
            <div className={`bt-job-date bt-fill-${EXP_FILLS[i % EXP_FILLS.length]}`}>
              <span className="bt-job-idx">{String(experience.length - i).padStart(2, "0")}</span>
              <span className="bt-job-when">
                {e.start}{" "}
                <br />— {e.end}
              </span>
              <span className="bt-job-loc">{e.location}</span>
            </div>
            <div className="bt-job-body">
              <h3 className="bt-job-role">{e.role}</h3>
              <p className="bt-job-co">
                {e.url ? (
                  <a href={e.url} {...ext}>
                    {e.company} <ArrowUpRightIcon size={15} />
                  </a>
                ) : (
                  e.company
                )}
              </p>
              <p className="bt-job-sum">{e.summary}</p>
              <ul className="bt-job-hl">
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <ul className="bt-chips" aria-label="Tech used">
                {e.tech.map((t) => (
                  <li key={t} className="bt-chip bt-chip--sm">{t}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="bt-tile bt-edu">
        <div className="bt-job-date bt-fill-lilac">
          <span className="bt-job-idx">EDU</span>
          <span className="bt-job-when">
            {education.start}{" "}
            <br />— {education.end}
          </span>
        </div>
        <div className="bt-job-body bt-edu-body">
          <div>
            <h3 className="bt-job-role">{education.degree}</h3>
            <p className="bt-job-co">{education.school}</p>
          </div>
          <span className="bt-sticker bt-sticker--score">{education.score}</span>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="bt-section" id="skills" aria-labelledby="bt-sk-h">
      <div className="bt-sec-head">
        <div>
          <p className="bt-label">04 / Toolbox</p>
          <h2 id="bt-sk-h" className="bt-h2">
            The <span className="bt-hl bt-fill-mint">toolbox.</span>
          </h2>
        </div>
      </div>
      <div className="bt-skills">
        {skills.map((g, i) => (
          <div key={g.group} className="bt-tile bt-skill">
            <div className={`bt-skill-head bt-fill-${SKILL_FILLS[i % SKILL_FILLS.length]}`}>
              <h3>{g.group}</h3>
              <span className="bt-skill-n">{String(g.items.length).padStart(2, "0")}</span>
            </div>
            <ul className="bt-chips">
              {g.items.map((s) => (
                <li key={s} className="bt-chip">{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function CertThumb({ c, i }) {
  const [failed, setFailed] = useState(!c.image);
  if (failed)
    return (
      <div className={`bt-cert-badge bt-fill-${FILLS[i % FILLS.length]} bt-pat-dots`} aria-hidden="true">
        <span>{initials(c.issuer.replace(/·.*/, ""))}</span>
      </div>
    );
  return (
    <a className="bt-cert-thumb" href={c.image} {...ext} aria-label={`Open ${c.name} certificate image`}>
      <img src={c.image} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      <span className="bt-cert-open" aria-hidden="true">
        View <ArrowUpRightIcon size={14} />
      </span>
    </a>
  );
}

function Certifications() {
  return (
    <section className="bt-section" id="certifications" aria-labelledby="bt-cert-h">
      <div className="bt-sec-head">
        <div>
          <p className="bt-label">05 / Proof</p>
          <h2 id="bt-cert-h" className="bt-h2">
            <span className="bt-hl bt-fill-lilac">Certified.</span>
          </h2>
        </div>
      </div>
      <ul className="bt-certs">
        {certifications.map((c, i) => (
          <li key={c.id} className="bt-tile bt-cert">
            <CertThumb c={c} i={i} />
            <div className="bt-cert-body">
              <span className="bt-label">
                {c.issuer} · {c.date}
              </span>
              <h3 className="bt-cert-name">{c.name}</h3>
              <span className="bt-cert-note">{c.note}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Contact() {
  return (
    <section className="bt-section bt-contact-sec" id="contact" aria-labelledby="bt-ct-h">
      <div className="bt-tile bt-contact bt-fill-yellow">
        <p className="bt-label">06 / Contact</p>
        <h2 id="bt-ct-h" className="bt-giant">
          Let’s build
          <br />
          something.
        </h2>
        <p className="bt-contact-sub">
          {profile.availability} · based in {profile.location}. Have a role, a project or a question? My inbox is open.
        </p>
        <CopyEmail email={profile.email} />
        <ul className="bt-contact-socials">
          {socials.map((s) => {
            const Icon = socialIcon[s.id];
            return (
              <li key={s.id}>
                <a className="bt-btn" href={s.url} {...(s.id === "email" ? {} : ext)}>
                  <Icon size={18} /> {s.label}
                </a>
              </li>
            );
          })}
        </ul>
        <span className="bt-sticker bt-sticker--reply" aria-hidden="true">Say hi ✦</span>
        <img
          className="bt-avatar"
          src={photos.bento.avatar}
          alt={`Cartoon ${profile.firstName} waving hello`}
          width="720"
          height="600"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}

export default function BentoTheme({ page = "home" }) {
  useFonts(FONTS);
  const reduced = usePrefersReducedMotion();
  const archive = page === "archive";

  useEffect(() => {
    if (!archive) return;
    const id = requestAnimationFrame(() => {
      document.querySelector(".th-bento #work .bt-sec-head")?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [archive]);

  return (
    <div className="th-bento">
      <Cursor />
      <a className="bt-skip" href="#main">
        Skip to content
      </a>
      <TopBar />
      <main id="main">
        <Hero reduced={reduced} />
        <Work reduced={reduced} emphasise={archive} />
        <Experience />
        <Skills />
        <Certifications />
        <Contact />
      </main>
      <footer className="bt-foot">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Designed &amp; built by hand — React + plain CSS.</span>
        <a href="#about">Back to top ↑</a>
      </footer>
    </div>
  );
}
