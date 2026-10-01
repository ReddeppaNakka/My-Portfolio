import { useMemo, useState } from "react";
import { projects } from "../../../data/portfolio";
import { CATEGORY_LABEL, ProjectThumb, StatusBadge, useOs } from "../common";

const FILTERS = [
  { id: "all", label: "All projects", test: () => true },
  { id: "ai", label: "AI", test: (p) => p.category === "ai" },
  { id: "fullstack", label: "Full-stack", test: (p) => p.category === "fullstack" },
  { id: "ml", label: "ML", test: (p) => p.category === "ml" },
  { id: "frontend", label: "Frontend", test: (p) => p.category === "frontend" },
  { id: "live", label: "Live", test: (p) => p.status === "live" },
];

function FilterGlyph({ id }) {
  const paths = {
    all: <path d="M4 6h16M4 12h16M4 18h16" />,
    ai: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2M12 9a3 3 0 100 6 3 3 0 000-6z" />,
    fullstack: <path d="M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4" />,
    ml: <path d="M5 19V9M10 19V5M15 19v-7M20 19V8" />,
    frontend: <path d="M3 5h18v14H3zM3 9h18M8 13l-2 2 2 2M14 13l2 2-2 2" />,
    live: <path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M5 5a10 10 0 000 14M19 5a10 10 0 010 14" />,
  };
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[id]}
    </svg>
  );
}

export default function Projects() {
  const { openApp } = useOs();
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, projects.filter(f.test).length])), []);
  const list = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    const q = query.trim().toLowerCase();
    return projects.filter(f.test).filter((p) => {
      if (!q) return true;
      return [p.name, p.short, p.description, p.madeAt, ...p.tech].join(" ").toLowerCase().includes(q);
    });
  }, [filter, query]);

  const current = FILTERS.find((x) => x.id === filter);

  return (
    <div className="os-app os-finder">
      <nav className="os-finder-side" aria-label="Project filters">
        <p className="os-finder-sidehead">Library</p>
        <ul>
          {FILTERS.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className={`os-finder-filter${filter === f.id ? " is-on" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                <FilterGlyph id={f.id} />
                <span>{f.label}</span>
                <em>{counts[f.id]}</em>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="os-finder-main">
        <div className="os-finder-bar">
          <h2 className="os-finder-title">{current.label}</h2>
          <label className="os-search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span className="sr-only">Search projects</span>
            <input type="search" placeholder="Search name or tech" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="os-seg" role="group" aria-label="View">
            <button type="button" aria-pressed={view === "grid"} aria-label="Grid view" onClick={() => setView("grid")}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <rect x="4" y="4" width="7" height="7" rx="1.5" />
                <rect x="13" y="4" width="7" height="7" rx="1.5" />
                <rect x="4" y="13" width="7" height="7" rx="1.5" />
                <rect x="13" y="13" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <button type="button" aria-pressed={view === "list"} aria-label="List view" onClick={() => setView("list")}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
              </svg>
            </button>
          </div>
        </div>

        {/* Compact filter row for narrow windows / phones */}
        <div className="os-finder-chips" role="group" aria-label="Project filters">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.id === "all" ? "All" : f.label} <em>{counts[f.id]}</em>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="os-empty">No projects match “{query}”.</p>
        ) : view === "grid" ? (
          <ul className="os-finder-grid">
            {list.map((p) => (
              <li key={p.id}>
                <button type="button" className="os-pitem" onClick={(e) => openApp("project", { id: p.id }, e.currentTarget)}>
                  <span className="os-pitem-thumb">
                    <ProjectThumb project={p} />
                  </span>
                  <span className="os-pitem-body">
                    <span className="os-pitem-name">{p.name}</span>
                    <span className="os-pitem-short">{p.short}</span>
                    <span className="os-pitem-meta">
                      <StatusBadge status={p.status} />
                      <span className="os-pitem-cat">{CATEGORY_LABEL[p.category]} · {p.year}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="os-finder-list">
            <div className="os-flist-head" aria-hidden="true">
              <span>Name</span>
              <span>Kind</span>
              <span>Status</span>
              <span>Year</span>
            </div>
            {list.map((p) => (
              <button
                key={p.id}
                type="button"
                className="os-flist-row"
                onClick={(e) => openApp("project", { id: p.id }, e.currentTarget)}
              >
                <span className="os-flist-name">
                  <span className="os-flist-ico">
                    <ProjectThumb project={p} compact />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.short}</small>
                  </span>
                </span>
                <span>{CATEGORY_LABEL[p.category]}</span>
                <span><StatusBadge status={p.status} /></span>
                <span>{p.year}</span>
              </button>
            ))}
          </div>
        )}
        <p className="os-finder-status" aria-live="polite">
          {list.length} of {projects.length} items · click an item to open it
        </p>
      </div>
    </div>
  );
}
