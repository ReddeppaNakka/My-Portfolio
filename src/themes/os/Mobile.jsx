import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile, experience, projects } from "../../data/portfolio";
import { AppIcon } from "./AppIcon";
import { APPS, DESKTOP_ICONS, appTitle } from "./registry";
import { OsContext, formatIST, prefersReducedMotion, useNow } from "./common";
import { winId } from "./wm";

const HOME_APPS = DESKTOP_ICONS;
const DOCK = ["projects", "terminal", "contact"];
const SHORT = { resume: "Résumé", readme: "Read me", certs: "Certificates", about: "About Me" };

function StatusBar() {
  const now = useNow();
  return (
    <div className="os-m-status">
      <time dateTime={now.toISOString()}>{formatIST(now, { hour: "numeric", minute: "2-digit", hour12: false })}</time>
      <span className="os-m-status-ico" aria-hidden="true">
        <svg viewBox="0 0 20 12" width="18" height="11"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg viewBox="0 0 28 14" width="25" height="12"><rect x="1" y="1" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".6" /><rect x="3" y="3" width="18" height="8" rx="2" /><path d="M25 5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".6" /></svg>
      </span>
    </div>
  );
}

function Sheet({ entry, top, depth, prevTitle, onBack }) {
  const { Component } = APPS[entry.app];
  const ref = useRef(null);
  const backRef = useRef(null);
  const title = appTitle(entry.app, entry.props).replace(" — reddy@os", "");

  useEffect(() => {
    if (top) backRef.current?.focus({ preventScroll: true });
  }, [top]);

  return (
    <section
      ref={ref}
      className={`os-sheet${entry.closing ? " is-closing" : ""}${entry.app === "terminal" ? " is-dark" : ""}`}
      style={{ zIndex: 50 + depth }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      inert={!top || undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) {
          e.preventDefault();
          onBack();
        }
      }}
    >
      <header className="os-sheet-bar">
        <button ref={backRef} type="button" className="os-sheet-back" onClick={onBack}>
          ‹ {prevTitle}
        </button>
        <h2 className="os-sheet-title">{title}</h2>
        <span className="os-sheet-spacer" aria-hidden="true" />
      </header>
      <div className={`os-sheet-body os-sheet-body--${entry.app}`}>
        <Component {...entry.props} active={top} />
      </div>
    </section>
  );
}

export default function Mobile({ page }) {
  const [stack, setStack] = useState(() => (page === "archive" ? [{ key: "projects", app: "projects", props: {} }] : []));
  const timers = useRef([]);
  const lastTrigger = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const openApp = useCallback((app, props = {}, el) => {
    const key = winId(app, props);
    if (el) lastTrigger.current.push(el);
    setStack((s) => {
      const i = s.findIndex((x) => x.key === key);
      if (i >= 0) return s.slice(0, i + 1).map((x) => ({ ...x, closing: false }));
      return [...s, { key, app, props }];
    });
  }, []);

  const back = useCallback(() => {
    const done = () => {
      setStack((s) => s.slice(0, -1));
      const el = lastTrigger.current.pop();
      if (el?.isConnected) el.focus({ preventScroll: true });
    };
    if (prefersReducedMotion()) return done();
    setStack((s) => s.map((x, i) => (i === s.length - 1 ? { ...x, closing: true } : x)));
    timers.current.push(setTimeout(done, 220));
  }, []);

  const ctx = useMemo(() => ({ openApp, mobile: true }), [openApp]);
  const hasSheet = stack.length > 0;

  return (
    <OsContext.Provider value={ctx}>
      <div className="os-phone">
        <div className="os-m-home" inert={hasSheet || undefined}>
          <StatusBar />
          <main className="os-m-main">
            <section className="os-m-widget" aria-label="Profile">
              <img src={profile.photo} alt={`Portrait of ${profile.name}`} width="64" height="64" />
              <div>
                <h1>{profile.name}</h1>
                <p>{profile.title} · {profile.role}</p>
                <span className="os-m-avail"><i aria-hidden="true" />{profile.availability}</span>
              </div>
            </section>
            <nav aria-label="Apps">
              <ul className="os-m-grid">
                {HOME_APPS.map((d) => (
                  <li key={d.app}>
                    <button type="button" className="os-m-app" onClick={(e) => openApp(d.app, {}, e.currentTarget)}>
                      <AppIcon app={d.app} size={58} />
                      <span>{SHORT[d.app] || d.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="os-m-now">
              <button type="button" onClick={(e) => openApp("experience", {}, e.currentTarget)}>
                <small>Latest role</small>
                <strong>{experience[0].company}</strong>
                <span>{experience[0].start} – {experience[0].end}</span>
              </button>
              <button type="button" onClick={(e) => openApp("projects", {}, e.currentTarget)}>
                <small>Projects</small>
                <strong>{projects.length} built</strong>
                <span>{projects.filter((p) => p.status === "live").length} with live demos</span>
              </button>
            </div>
          </main>
          <nav className="os-m-dock" aria-label="Dock">
            {DOCK.map((app) => (
              <button key={app} type="button" className="os-m-app" aria-label={appTitle(app).replace(" — reddy@os", "")} onClick={(e) => openApp(app, {}, e.currentTarget)}>
                <AppIcon app={app} size={54} />
              </button>
            ))}
          </nav>
        </div>
        {stack.map((entry, i) => (
          <Sheet
            key={entry.key}
            entry={entry}
            depth={i}
            top={i === stack.length - 1}
            prevTitle={i === 0 ? "Home" : appTitle(stack[i - 1].app, stack[i - 1].props).replace(" — reddy@os", "").slice(0, 18)}
            onBack={back}
          />
        ))}
      </div>
    </OsContext.Provider>
  );
}
