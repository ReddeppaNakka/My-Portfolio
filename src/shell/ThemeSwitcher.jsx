import { useEffect, useRef, useState } from "react";
import { THEMES } from "./themes";
import "./switcher.css";

// Tiny CSS-drawn previews so the picker needs no screenshots.
function Preview({ id }) {
  return (
    <span className={`ts-prev ts-prev-${id}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function ThemeSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
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
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  const pick = (id) => {
    setOpen(false);
    if (id !== current) onChange(id);
  };

  return (
    <div className="ts-root" ref={rootRef}>
      {open && (
        <div className="ts-panel" role="dialog" aria-label="Choose a portfolio design">
          <p className="ts-title">Same person, four designs</p>
          <ul className="ts-list">
            {THEMES.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`ts-option${t.id === current ? " is-active" : ""}`}
                  aria-pressed={t.id === current}
                  onClick={() => pick(t.id)}
                >
                  <Preview id={t.id} />
                  <span className="ts-text">
                    <span className="ts-name">
                      <span className="ts-num">0{i + 1}</span> {t.name}
                    </span>
                    <span className="ts-blurb">{t.blurb}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="ts-button"
        aria-expanded={open}
        aria-label="Switch portfolio design"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
        <span className="ts-label">Switch design</span>
      </button>
    </div>
  );
}

export default ThemeSwitcher;
