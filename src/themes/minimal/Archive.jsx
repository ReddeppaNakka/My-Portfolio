import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { profile, projects } from "../../data/portfolio";
import { GitHubIcon, ExternalIcon } from "../../shell/icons";
import { ext, hostname, Pills, StatusBadge } from "./parts";

const sorted = [...projects].sort((a, b) => b.year - a.year);

function Links({ p, compact = false }) {
  return (
    <ul className={`m-tlinks${compact ? " m-tlinks--compact" : ""}`}>
      {p.github && (
        <li>
          <a href={p.github} {...ext} aria-label={`${p.name} on GitHub`}>
            <GitHubIcon size={compact ? 14 : 17} />
            {compact && "GitHub"}
          </a>
        </li>
      )}
      {(p.extraLinks || []).map((l) => (
        <li key={l.url}>
          <a href={l.url} {...ext} aria-label={`${p.name}: ${l.label}`} title={l.label}>
            <GitHubIcon size={compact ? 14 : 17} />
            {compact && l.label}
          </a>
        </li>
      ))}
      {p.live && (
        <li>
          <a href={p.live} {...ext} className="m-tlinks__live" aria-label={`${p.name} live site, ${hostname(p.live)}`}>
            <ExternalIcon size={compact ? 14 : 15} />
            <span>{hostname(p.live)}</span>
          </a>
        </li>
      )}
    </ul>
  );
}

export default function Archive() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="m-archive">
      <header className="m-archive__head">
        <Link className="m-back" to={{ pathname: "/", search: location.search }}>
          <span aria-hidden="true">←</span> {profile.name}
        </Link>
        <h1 className="m-archive__title">All Projects</h1>
        <p className="m-archive__sub">
          Everything I've built, from production platforms to experiments — {projects.length} projects.
        </p>
      </header>
      <main id="m-content" tabIndex={-1}>
        <table className="m-table">
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Project</th>
              <th scope="col" className="m-col-made">Made at</th>
              <th scope="col" className="m-col-tech">Built with</th>
              <th scope="col" className="m-col-links">Links</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const href = p.live || p.github;
              return (
                <tr key={p.id}>
                  <td className="m-t-year">{p.year}</td>
                  <td className="m-t-name">
                    <div className="m-t-namerow">
                      <a href={href} {...ext} className="m-t-namelink">
                        {p.name}

                      </a>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="m-t-short">{p.short}</p>
                    <div className="m-t-moblinks">
                      <Links p={p} compact />
                    </div>
                  </td>
                  <td className="m-col-made m-t-made">{p.madeAt}</td>
                  <td className="m-col-tech">
                    <Pills items={p.tech} />
                  </td>
                  <td className="m-col-links">
                    <Links p={p} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </div>
  );
}
