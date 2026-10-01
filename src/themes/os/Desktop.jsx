import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { profile } from "../../data/portfolio";
import { AppIcon, OsLogo } from "./AppIcon";
import Window from "./Window";
import { APPS, DESKTOP_ICONS, DOCK_APPS, LABELS, appName, appTitle } from "./registry";
import { initWM, wmReducer } from "./wm";
import { OsContext, ProjectThumb, formatIST, prefersReducedMotion, useNow } from "./common";
import { projects } from "../../data/portfolio";

const getVp = () => ({ w: window.innerWidth, h: window.innerHeight });

function centerPoint(el) {
  if (!el?.getBoundingClientRect) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/* ---------------- Menu bar ---------------- */

function Menu({ label, labelNode, items, className = "" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const first = rootRef.current?.querySelector('[role="menuitem"]:not([disabled])');
    first?.focus();
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onKey = (e) => {
    const list = [...rootRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')];
    const i = list.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      list[(i + 1) % list.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      list[(i - 1 + list.length) % list.length]?.focus();
    }
  };

  return (
    <div className={`os-menu ${className}`} ref={rootRef} onKeyDown={open ? onKey : undefined}>
      <button
        ref={btnRef}
        type="button"
        className={`os-menu-btn${open ? " is-open" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={labelNode ? label : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {labelNode || label}
      </button>
      {open && (
        <div className="os-menu-pop" role="menu" aria-label={label}>
          {items.map((it, i) =>
            it === "-" ? (
              <hr key={`sep${i}`} />
            ) : (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false);
                  it.run();
                }}
              >
                <span>{it.label}</span>
                {it.hint && <kbd>{it.hint}</kbd>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function Clock() {
  const now = useNow();
  return (
    <time className="os-clock" dateTime={now.toISOString()} title="Hyderabad time (IST)">
      <span className="os-clock-date">{formatIST(now, { weekday: "short", day: "numeric", month: "short" })}</span>
      <span>{formatIST(now, { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()}</span>
    </time>
  );
}

function MenuBar({ focusedWin, openApp, dispatch }) {
  const fid = focusedWin?.id;
  return (
    <header className="os-menubar">
      <nav className="os-menubar-left" aria-label="Menu bar">
        <Menu
          className="os-menu--logo"
          label="Reddy OS menu"
          labelNode={
            <>
              <OsLogo size={16} />
              <span className="os-menubar-brand">Reddy OS</span>
            </>
          }
          items={[
            { label: "About this portfolio", run: () => openApp("osinfo") },
            { label: "Read me first", run: () => openApp("readme") },
            "-",
            { label: "Open Terminal", run: () => openApp("terminal") },
            { label: "Close all windows", run: () => dispatch({ type: "closeAll" }) },
          ]}
        />
        <span className="os-menubar-app">{focusedWin ? appName(focusedWin.app) : "Desktop"}</span>
        <Menu
          label="Go"
          items={DESKTOP_ICONS.map((d) => ({ label: d.label, run: () => openApp(d.app) }))}
        />
        <Menu
          label="Window"
          items={[
            { label: "Minimise", disabled: !fid, run: () => document.querySelector(".th-os .os-win.is-active .os-wc--min")?.click() },
            { label: "Maximise / Restore", disabled: !fid, run: () => dispatch({ type: "toggleMax", id: fid }) },
            { label: "Cycle windows", hint: "Ctrl `", run: () => dispatch({ type: "cycle" }) },
            "-",
            { label: "Close window", hint: "Esc", disabled: !fid, run: () => document.querySelector(".th-os .os-win.is-active .os-wc--close")?.click() },
          ]}
        />
        <Menu
          label="Help"
          items={[
            { label: "Read me first", run: () => openApp("readme") },
            { label: "Email Reddeppa", run: () => openApp("contact") },
          ]}
        />
      </nav>
      <div className="os-menubar-right">
        <span className="os-status" title={profile.availability}>
          <i className="os-status-dot" aria-hidden="true" />
          <span className="os-status-text">{profile.availability}</span>
        </span>
        <svg className="os-mb-ico" viewBox="0 0 24 24" width="16" height="16" aria-label="Wi-Fi connected" role="img">
          <path d="M2 9a15 15 0 0120 0M5.5 12.5a10 10 0 0113 0M9 16a5 5 0 016 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="19.2" r="1.4" fill="currentColor" />
        </svg>
        <svg className="os-mb-ico" viewBox="0 0 28 16" width="24" height="14" aria-label="Battery full" role="img">
          <rect x="1" y="2" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
          <rect x="3.2" y="4.2" width="17.6" height="7.6" rx="2" fill="currentColor" />
          <path d="M25 6v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
        </svg>
        <Clock />
      </div>
    </header>
  );
}

/* ---------------- Desktop icons ---------------- */

function DesktopIcons({ openApp, selected, setSelected }) {
  const refs = useRef([]);
  const onKey = (i, app) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      openApp(app, {}, e.currentTarget);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = (i + (e.key === "ArrowDown" ? 1 : -1) + DESKTOP_ICONS.length) % DESKTOP_ICONS.length;
      refs.current[n]?.focus();
      setSelected(DESKTOP_ICONS[n].app);
    }
  };
  return (
    <nav className="os-icons" aria-label="Desktop">
      <ul>
        {DESKTOP_ICONS.map((d, i) => (
          <li key={d.app}>
            <button
              ref={(el) => (refs.current[i] = el)}
              type="button"
              className={`os-dicon${selected === d.app ? " is-sel" : ""}`}
              aria-pressed={selected === d.app}
              aria-label={`${d.label} — double-click or press Enter to open`}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(d.app);
              }}
              onDoubleClick={(e) => openApp(d.app, {}, e.currentTarget)}
              onKeyDown={onKey(i, d.app)}
            >
              <AppIcon app={d.app} size={50} />
              <span className="os-dicon-label">{d.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------------- Dock ---------------- */

function Dock({ wins, focused, openApp, dispatch }) {
  const dockRef = useRef(null);
  const centers = useRef([]);
  const raf = useRef(0);

  const measure = () => {
    const items = [...dockRef.current.querySelectorAll(".os-dock-tile")];
    centers.current = items.map((el) => {
      const r = el.parentElement.getBoundingClientRect();
      return [el, r.left + r.width / 2];
    });
  };
  const onMove = (e) => {
    if (prefersReducedMotion() || e.pointerType !== "mouse") return;
    if (!centers.current.length) measure();
    const x = e.clientX;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      for (const [el, cx] of centers.current) {
        const d = Math.abs(x - cx);
        const s = 1 + 0.42 * Math.max(0, 1 - d / 130) ** 1.6;
        el.style.transform = `translateY(${-(s - 1) * 26}px) scale(${s})`;
      }
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    for (const [el] of centers.current) el.style.transform = "";
    centers.current = [];
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const running = new Set(wins.map((w) => w.app));
  const tray = wins.filter((w) => w.min && !DOCK_APPS.includes(w.app));

  const activate = (app, el) => {
    const mine = wins.filter((w) => w.app === app);
    if (!mine.length) return openApp(app, {}, el);
    const minimised = mine.find((w) => w.min);
    const visible = mine.filter((w) => !w.min);
    if (minimised && !visible.length) return dispatch({ type: "open", app, props: minimised.props });
    const top = visible.reduce((b, w) => (w.z > b.z ? w : b));
    if (top.id !== focused) dispatch({ type: "focus", id: top.id });
    else if (minimised) dispatch({ type: "open", app, props: minimised.props });
  };

  return (
    <nav className="os-dock" aria-label="Dock" ref={dockRef} onPointerMove={onMove} onPointerLeave={onLeave}>
      <ul>
        {DOCK_APPS.map((app) => (
          <li key={app}>
            <button
              type="button"
              className="os-dock-item"
              data-dock-app={app}
              aria-label={`${LABELS[app]}${running.has(app) ? " (open)" : ""}`}
              onClick={(e) => activate(app, e.currentTarget)}
            >
              <span className="os-dock-tile">
                <AppIcon app={app} size={50} />
              </span>
              <span className="os-dock-tip" aria-hidden="true">{LABELS[app]}</span>
              <i className={`os-dock-run${running.has(app) ? " is-on" : ""}`} aria-hidden="true" />
            </button>
          </li>
        ))}
        <li className="os-dock-sep" aria-hidden="true" data-dock-tray />
        {tray.map((w) => {
          const p = w.app === "project" ? projects.find((x) => x.id === w.props.id) : null;
          const t = appTitle(w.app, w.props);
          return (
            <li key={w.id}>
              <button
                type="button"
                className="os-dock-item"
                aria-label={`Restore ${t}`}
                onClick={() => dispatch({ type: "open", app: w.app, props: w.props })}
              >
                <span className="os-dock-tile os-dock-mini">
                  {p ? <ProjectThumb project={p} compact /> : <AppIcon app={w.app} size={50} />}
                </span>
                <span className="os-dock-tip" aria-hidden="true">{t}</span>
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className="os-dock-item"
            data-dock-app="readme"
            aria-label="Read me first"
            onClick={(e) => activate("readme", e.currentTarget)}
          >
            <span className="os-dock-tile">
              <AppIcon app="readme" size={50} />
            </span>
            <span className="os-dock-tip" aria-hidden="true">Read me</span>
            <i className={`os-dock-run${running.has("readme") ? " is-on" : ""}`} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

/* ---------------- Desktop ---------------- */

export default function Desktop({ page }) {
  const [vp, setVp] = useState(getVp);
  const vpRef = useRef(vp);
  const [state, dispatch] = useReducer(wmReducer, { vp, page }, initWM);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        vpRef.current = getVp();
        setVp(vpRef.current);
      });
    };
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  const openApp = useCallback((app, props = {}, originEl) => {
    dispatch({ type: "open", app, props, vp: vpRef.current, origin: centerPoint(originEl) });
  }, []);

  // Ctrl/Cmd + ` cycles windows.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === "Backquote" || e.key === "`")) {
        e.preventDefault();
        dispatch({ type: "cycle" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ranks = useMemo(() => {
    const sorted = [...state.wins].sort((a, b) => a.z - b.z);
    return Object.fromEntries(sorted.map((w, i) => [w.id, i]));
  }, [state.wins]);

  const focusedWin = state.wins.find((w) => w.id === state.focused);
  const ctx = useMemo(() => ({ openApp, mobile: false }), [openApp]);

  return (
    <OsContext.Provider value={ctx}>
      <div className={`os-desktop${busy ? " is-busy" : ""}`}>
        <MenuBar focusedWin={focusedWin} openApp={openApp} dispatch={dispatch} />
        <main
          className="os-workspace"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(null);
              dispatch({ type: "blur" });
            }
          }}
        >
          <h1 className="sr-only">
            {profile.name} — {profile.title}. Portfolio desktop.
          </h1>
          <DesktopIcons openApp={openApp} selected={selected} setSelected={setSelected} />
          {state.wins.map((w) => {
            const { Component, dark, flush } = APPS[w.app];
            return (
              <Window
                key={w.id}
                win={w}
                rank={ranks[w.id]}
                active={state.focused === w.id}
                vp={vp}
                dispatch={dispatch}
                setBusy={setBusy}
                title={appTitle(w.app, w.props)}
                iconApp={w.app === "project" ? "projects" : w.app}
                dark={dark}
                flush={flush}
              >
                <Component {...w.props} active={state.focused === w.id} />
              </Window>
            );
          })}
        </main>
        <Dock wins={state.wins} focused={state.focused} openApp={openApp} dispatch={dispatch} />
      </div>
    </OsContext.Provider>
  );
}
