import { useCallback, useEffect, useRef, useState } from "react";
import { useFonts } from "../../shell/useFonts";
import { profile } from "../../data/portfolio";
import { FileIcon } from "../../shell/icons";
import { CHAPTERS, Hero, Threshold, Path, Craft, Afterlight, Garden } from "./Chapters";
import { useReveal } from "./useReveal";
import Cursor from "./Cursor";
import "./temple.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Shippori+Mincho:wght@500;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap";

const media = (q) => typeof window !== "undefined" && window.matchMedia?.(q).matches;

// Cheap capability probe so a missing GPU falls back quietly (no three.js errors).
function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function TempleTheme({ page = "home" }) {
  useFonts(FONTS);
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [webgl, setWebgl] = useState(true);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reduced] = useState(() => media("(prefers-reduced-motion: reduce)"));

  /* ---------- WebGL world ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (!hasWebGL()) {
      setWebgl(false);
      return undefined;
    }
    const mobile = media("(max-width: 767px)") || media("(pointer: coarse)");
    let scene;
    let cancelled = false;
    let readyTimer = 0;
    // module is code-split so the 3D world never blocks first paint of the content
    import("./scene")
      .then(({ createTempleScene }) => {
        if (cancelled) return;
        try {
          scene = createTempleScene(canvas, {
            mobile,
            reducedMotion: reduced,
            onFirstFrame: () => {
              readyTimer = window.setTimeout(() => !cancelled && setReady(true), 60);
            },
            onTooSlow: () => {
              if (cancelled) return;
              console.info("[temple] Device too slow for the 3D scene, using painted fallback.");
              sceneRef.current?.dispose();
              sceneRef.current = null;
              setWebgl(false);
            },
          });
        } catch (err) {
          console.info("[temple] WebGL unavailable, using painted fallback.", err?.message);
          setWebgl(false);
          return;
        }
        sceneRef.current = scene;
        computeProgress(true);
        if (!document.hidden) scene.start();
      })
      .catch(() => !cancelled && setWebgl(false));

    const onVis = () => {
      if (!sceneRef.current) return;
      if (document.hidden) sceneRef.current.stop();
      else sceneRef.current.start();
    };
    const onResize = () => sceneRef.current?.resize();
    const onPointer = (e) => {
      sceneRef.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    const io = new IntersectionObserver(([entry]) => {
      if (!sceneRef.current) return;
      if (entry.isIntersecting && !document.hidden) sceneRef.current.start();
      else sceneRef.current.stop();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelled = true;
      window.clearTimeout(readyTimer);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      if (sceneRef.current) sceneRef.current.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- scroll → chapter progress ---------- */
  const computeProgress = useCallback((jump = false) => {
    const root = rootRef.current;
    if (!root) return;
    const secs = root.querySelectorAll("[data-chapter]");
    const vh = window.innerHeight;
    const y = window.scrollY;
    const maxY = Math.max(1, document.documentElement.scrollHeight - vh);
    const b = [];
    secs.forEach((s, i) => {
      b.push(i === 0 ? 0 : Math.min(s.getBoundingClientRect().top + y - vh * 0.38, maxY));
    });
    let i = 0;
    while (i < b.length - 1 && y >= b[i + 1]) i++;
    let k = i;
    if (i < b.length - 1) k = i + Math.min(1, Math.max(0, (y - b[i]) / Math.max(1, b[i + 1] - b[i])));
    if (sceneRef.current) {
      if (jump) sceneRef.current.jump(k);
      else sceneRef.current.setProgress(k);
    }
    setActive((prev) => (prev === i ? prev : i));
    setProgress(y / maxY);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => computeProgress(false));
    };
    computeProgress(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [computeProgress]);

  /* ---------- archive route: land on the work ---------- */
  useEffect(() => {
    if (page !== "archive") return undefined;
    const t = window.setTimeout(() => {
      document.getElementById("tp-craft")?.scrollIntoView({ behavior: "auto" });
      computeProgress(true);
    }, 80);
    return () => window.clearTimeout(t);
  }, [page, computeProgress]);

  useReveal(rootRef, reduced);

  const jumpTo = useCallback(
    (i) => {
      setMenuOpen(false);
      const el = document.getElementById(`tp-${CHAPTERS[i].id}`);
      if (!el) return;
      const top = i === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      const focusTarget = el.querySelector("h1, h2");
      if (focusTarget) {
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({ preventScroll: true });
      }
    },
    [reduced]
  );

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div ref={rootRef} className={`th-temple${ready ? " is-ready" : ""}${reduced ? " is-reduced" : ""}${webgl ? "" : " no-webgl"}`}>
      <a className="tp-skip" href="#tp-main">
        Skip to content
      </a>

      {/* painted fallback sits under the canvas; it's also the loading backdrop */}
      <div className="tp-painted" aria-hidden="true">
        <span className="tp-painted-moon" />
        <span className="tp-painted-ridge tp-r1" />
        <span className="tp-painted-ridge tp-r2" />
        <span className="tp-painted-ridge tp-r3" />
      </div>
      {webgl && <canvas ref={canvasRef} className="tp-canvas" aria-hidden="true" />}
      <div className="tp-scrim" aria-hidden="true" />
      <div className="tp-grain" aria-hidden="true" />

      <header className="tp-header">
        <a className="tp-brand" href="#tp-kage" onClick={(e) => (e.preventDefault(), jumpTo(0))}>
          <span className="tp-brand-seal" lang="ja" aria-hidden="true">
            影
          </span>
          <span className="tp-brand-name">{profile.name}</span>
        </a>
        <nav className="tp-nav" aria-label="Chapters">
          <ul>
            {CHAPTERS.slice(1).map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#tp-${c.id}`}
                  className={active === i + 1 ? "is-active" : ""}
                  aria-current={active === i + 1 ? "true" : undefined}
                  onClick={(e) => (e.preventDefault(), jumpTo(i + 1))}
                >
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="tp-header-end">
          <a className="tp-resume" href={profile.resume} target="_blank" rel="noopener noreferrer">
            <FileIcon size={15} /> Résumé
          </a>
          <button
            type="button"
            className="tp-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="tp-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="tp-mono">{menuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </header>

      <div id="tp-menu" className={`tp-menu${menuOpen ? " is-open" : ""}`} hidden={!menuOpen}>
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button type="button" onClick={() => jumpTo(i)} className={active === i ? "is-active" : ""}>
                <span className="tp-mono">{String(c.n).padStart(2, "0")}</span>
                <span className="tp-menu-title">{c.title}</span>
                <span lang="ja" className="tp-menu-kanji" aria-hidden="true">
                  {c.kanji}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <nav className="tp-rail" aria-label="Chapter rail">
        <div className="tp-rail-track" aria-hidden="true">
          <span className="tp-rail-fill" style={{ transform: `scaleY(${progress})` }} />
        </div>
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className={active === i ? "is-active" : ""}
                aria-current={active === i ? "step" : undefined}
                aria-label={`Chapter ${c.n}: ${c.title}`}
                onClick={() => jumpTo(i)}
              >
                <span className="tp-rail-n tp-mono">{String(c.n).padStart(2, "0")}</span>
                <span className="tp-rail-k" lang="ja" aria-hidden="true">
                  {c.kanji}
                </span>
                <span className="tp-rail-t tp-mono" aria-hidden="true">
                  {c.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <main id="tp-main" className="tp-main">
        <Hero onJump={jumpTo} />
        <Threshold />
        <Path />
        <Craft />
        <Afterlight />
      </main>
      <Garden />

      <Cursor />
    </div>
  );
}
