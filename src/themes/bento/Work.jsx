import { useLayoutEffect, useRef, useState } from "react";
import { projects, socials } from "../../data/portfolio";
import { GitHubIcon, ExternalIcon, ArrowUpRightIcon } from "../../shell/icons";
import { Cover, StatusSticker, ext } from "./parts";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "fullstack", label: "Full-stack" },
  { id: "ml", label: "ML" },
  { id: "frontend", label: "Frontend" },
];

const CAT_LABEL = { ai: "AI", fullstack: "Full-stack", ml: "ML", frontend: "Frontend" };

function ProjectCard({ project, index, setRef }) {
  return (
    <article ref={setRef} className="bt-tile bt-card">
      <div className="bt-card-media">
        <Cover project={project} index={index} />
        <span className="bt-card-sticker">
          <StatusSticker status={project.status} />
        </span>
      </div>
      <div className="bt-card-body">
        <div className="bt-card-meta">
          <span>{project.year}</span>
          <span aria-hidden="true">/</span>
          <span>{project.madeAt}</span>
          <span className="bt-card-cat">{CAT_LABEL[project.category]}</span>
        </div>
        <h3 className="bt-card-name">{project.name}</h3>
        <p className="bt-card-short">{project.short}</p>
        <ul className="bt-chips" aria-label="Tech stack">
          {project.tech.map((t) => (
            <li key={t} className="bt-chip bt-chip--sm">{t}</li>
          ))}
        </ul>
        <div className="bt-card-links">
          <a className="bt-btn bt-btn--sm" href={project.github} {...ext} aria-label={`${project.name} on GitHub`}>
            <GitHubIcon size={16} /> GitHub
          </a>
          {project.live && (
            <a className="bt-btn bt-btn--sm bt-btn--blue" href={project.live} {...ext} aria-label={`${project.name} live site`}>
              <ExternalIcon size={16} /> Live
            </a>
          )}
          {project.extraLinks?.map((l) => (
            <a key={l.url} className="bt-btn bt-btn--sm bt-btn--ghost" href={l.url} {...ext}>
              {l.label} <ArrowUpRightIcon size={14} />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Work({ reduced, emphasise }) {
  const [filter, setFilter] = useState("all");
  const nodes = useRef(new Map());
  const before = useRef(null);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.id] = f.id === "all" ? projects.length : projects.filter((p) => p.category === f.id).length;
    return acc;
  }, {});
  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const choose = (id) => {
    if (id === filter) return;
    const snap = new Map();
    nodes.current.forEach((el, key) => snap.set(key, el.getBoundingClientRect()));
    before.current = snap;
    setFilter(id);
  };

  // FLIP: animate cards from their previous grid slot; new arrivals pop in.
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    if (!prev || reduced) return;
    nodes.current.forEach((el, key) => {
      const now = el.getBoundingClientRect();
      const old = prev.get(key);
      if (old) {
        const dx = old.left - now.left;
        const dy = old.top - now.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
            duration: 520,
            easing: "cubic-bezier(.2,.8,.2,1)",
          });
        }
      } else {
        el.animate(
          [
            { opacity: 0, transform: "scale(.88) rotate(-1.5deg)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 420, delay: 120, easing: "cubic-bezier(.2,.9,.3,1.2)", fill: "backwards" }
        );
      }
    });
  }, [filter, reduced]);

  return (
    <section className={`bt-section bt-work${emphasise ? " is-archive" : ""}`} id="work" aria-labelledby="bt-work-h">
      <div className="bt-sec-head">
        <div>
          <p className="bt-label">02 / Work{emphasise ? " — Archive" : ""}</p>
          <h2 id="bt-work-h" className="bt-h2">
            Every project, <span className="bt-hl bt-fill-blue">no filler.</span>
          </h2>
        </div>
        <div className="bt-filters" role="group" aria-label="Filter projects by category">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`bt-filter${filter === f.id ? " is-on" : ""}`}
              aria-pressed={filter === f.id}
              onClick={() => choose(f.id)}
            >
              {f.label}
              <span className="bt-filter-n">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} project{shown.length === 1 ? "" : "s"}
      </p>
      <div className="bt-cards">
        {shown.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={projects.indexOf(p)}
            setRef={(el) => (el ? nodes.current.set(p.id, el) : nodes.current.delete(p.id))}
          />
        ))}
        <a
          ref={(el) => (el ? nodes.current.set("__more", el) : nodes.current.delete("__more"))}
          className="bt-tile bt-more bt-fill-yellow bt-pat-stripes"
          href={socials[0].url}
          {...ext}
        >
          <span className="bt-label">More on {socials[0].label}</span>
          <span className="bt-more-h">Experiments, notebooks &amp; the rest of the code.</span>
          <span className="bt-arrow" aria-hidden="true">
            <ArrowUpRightIcon size={20} />
          </span>
        </a>
      </div>
    </section>
  );
}
