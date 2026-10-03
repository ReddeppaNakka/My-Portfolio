import { useCallback, useEffect, useRef, useState } from "react";
import { THEMES } from "./themes";
import "./switcher.css";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const seen = (key) => {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};
const markSeen = (key) => {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* storage blocked — the nudge may simply show again */
  }
};

// Fires once per design per session when the visitor reaches the end of it.
// Scrolling designs: near the bottom of the page. Non-scrolling ones (the OS
// desktop): after a while of exploring.
function useEndOfDesign(current, onEnd) {
  useEffect(() => {
    const key = `ts-end-${current}`;
    if (seen(key)) return undefined;
    let done = false;
    let idle = 0;
    const fire = () => {
      if (done) return;
      done = true;
      markSeen(key);
      onEnd();
    };
    const onScroll = () => {
      const doc = document.documentElement;
      if (doc.scrollHeight <= window.innerHeight + 300) return;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 160) fire();
    };
    // give the lazily-loaded design time to lay out before measuring
    const start = window.setTimeout(() => {
      if (document.documentElement.scrollHeight <= window.innerHeight + 300) idle = window.setTimeout(fire, 40000);
      window.addEventListener("scroll", onScroll, { passive: true });
    }, 2000);
    return () => {
      done = true;
      window.clearTimeout(start);
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, [current, onEnd]);
}

function ThemeSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);
  const [dealt, setDealt] = useState(false); // cards fan out one frame after mounting
  const [curtain, setCurtain] = useState(null); // design being entered
  const [nudge, setNudge] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const firstCardRef = useRef(null);
  const timers = useRef([]);

  const idx = Math.max(0, THEMES.findIndex((t) => t.id === current));
  const cur = THEMES[idx];
  const next = THEMES[(idx + 1) % THEMES.length];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showNudge = useCallback(() => setNudge(true), []);
  useEndOfDesign(current, showNudge);
  useEffect(() => setNudge(false), [current]);

  useEffect(() => {
    if (!open) {
      setDealt(false);
      return undefined;
    }
    const raf = requestAnimationFrame(() => {
      setDealt(true);
      firstCardRef.current?.focus({ preventScroll: true });
    });
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  const pick = (id) => {
    setOpen(false);
    setNudge(false);
    if (id === current) return;
    if (reducedMotion()) {
      onChange(id);
      return;
    }
    // a curtain in the next design's colours sweeps in from the corner,
    // the design swaps underneath it, then the curtain lifts
    setCurtain(THEMES.find((t) => t.id === id));
    timers.current.push(
      setTimeout(() => onChange(id), 480),
      setTimeout(() => setCurtain(null), 1250)
    );
  };

  return (
    <div className="ts-root" ref={rootRef}>
      {open && <div className={`ts-scrim${dealt ? " is-on" : ""}`} aria-hidden="true" onClick={() => setOpen(false)} />}
      {open && (
        <div className={`ts-fan${dealt ? " is-dealt" : ""}`} role="dialog" aria-label="Choose a portfolio design">
          <p className="ts-fan-title">Same person · {THEMES.length} designs · pick a card</p>
          {THEMES.map((t, i) => {
            const here = t.id === current;
            return (
              <button
                key={t.id}
                ref={i === 0 ? firstCardRef : undefined}
                type="button"
                className={`ts-card${here ? " is-here" : ""}`}
                style={{ "--i": i, "--d": THEMES.length - 1 - i, "--accent": t.look.accent }}
                aria-current={here || undefined}
                aria-label={`${t.name} — ${t.blurb}${here ? " (current design)" : ""}`}
                onClick={() => pick(t.id)}
              >
                <span className="ts-card-shot">
                  <img src={t.thumb} alt="" width="560" height="350" loading="lazy" decoding="async" />
                  {here && <span className="ts-card-here">You're here</span>}
                </span>
                <span className="ts-card-cap">
                  <span className="ts-card-num">0{i + 1}</span>
                  <span className="ts-card-text">
                    <strong>{t.name}</strong>
                    <span>{t.blurb}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {nudge && !open && !curtain && (
        <div className="ts-nudge" role="status">
          <button type="button" className="ts-nudge-x" aria-label="Dismiss" onClick={() => setNudge(false)}>
            ×
          </button>
          <p className="ts-nudge-eyebrow">That's the end of {cur.name} ✦</p>
          <p className="ts-nudge-title">Want to see one more design?</p>
          <p className="ts-nudge-sub">Same story, told {THEMES.length - 1} other ways.</p>
          <button type="button" className="ts-nudge-next" onClick={() => pick(next.id)}>
            <img src={next.thumb} alt="" width="112" height="70" />
            <span>
              <small>Up next</small>
              <strong>{next.name} →</strong>
            </span>
          </button>
          <button
            type="button"
            className="ts-nudge-all"
            onClick={() => {
              setNudge(false);
              setOpen(true);
            }}
          >
            Or pick from all {THEMES.length}
          </button>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        className={`ts-button${nudge ? " is-calling" : ""}`}
        aria-expanded={open}
        aria-label={`Switch portfolio design (currently ${cur.name}, ${idx + 1} of ${THEMES.length})`}
        onClick={() => {
          setNudge(false);
          setOpen((o) => !o);
        }}
      >
        <span className="ts-pips" aria-hidden="true">
          {THEMES.map((t) => (
            <i key={t.id} className={t.id === current ? "is-on" : undefined} style={{ "--c": t.look.accent }} />
          ))}
        </span>
        <span className="ts-label">Switch design</span>
        <span className="ts-count" aria-hidden="true">
          {idx + 1}/{THEMES.length}
        </span>
      </button>

      {curtain && (
        <div
          className="ts-curtain"
          style={{ "--bg": curtain.look.bg, "--ink": curtain.look.ink, "--accent": curtain.look.accent }}
          aria-live="polite"
        >
          <span className="ts-curtain-small">Entering</span>
          <span className="ts-curtain-name">{curtain.name}</span>
          <span className="ts-curtain-bar" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
