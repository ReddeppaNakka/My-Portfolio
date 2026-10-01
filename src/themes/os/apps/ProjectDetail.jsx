import { projects } from "../../../data/portfolio";
import { GitHubIcon, ExternalIcon, ArrowUpRightIcon } from "../../../shell/icons";
import { CATEGORY_LABEL, EXT, ProjectThumb, StatusBadge } from "../common";

export default function ProjectDetail({ id }) {
  const p = projects.find((x) => x.id === id);
  if (!p) return <div className="os-app"><p className="os-empty">Project “{id}” not found.</p></div>;
  return (
    <article className="os-app os-pdetail">
      <div className="os-pdetail-cover">
        <ProjectThumb project={p} lazy={false} />
      </div>
      <div className="os-pdetail-body">
        <div className="os-pdetail-meta">
          <StatusBadge status={p.status} />
          <span>{CATEGORY_LABEL[p.category]}</span>
          <span>{p.year}</span>
          <span>{p.madeAt}</span>
        </div>
        <h1 className="os-pdetail-name">{p.name}</h1>
        <p className="os-pdetail-short">{p.short}</p>
        <p className="os-p">{p.description}</p>
        <h2 className="os-h3">Built with</h2>
        <ul className="os-chips" aria-label="Technologies">
          {p.tech.map((t) => (
            <li key={t} className="os-chip">{t}</li>
          ))}
        </ul>
        <div className="os-btnrow">
          {p.live && (
            <a className="os-btn os-btn--primary" href={p.live} {...EXT}>
              <ExternalIcon size={16} /> Live demo
            </a>
          )}
          <a className="os-btn" href={p.github} {...EXT}>
            <GitHubIcon size={16} /> GitHub
          </a>
          {p.extraLinks?.map((l) => (
            <a key={l.url} className="os-btn" href={l.url} {...EXT}>
              <ArrowUpRightIcon size={16} /> {l.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
