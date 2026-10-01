import { useEffect, useLayoutEffect, useRef } from "react";
import { AppIcon } from "./AppIcon";
import { MENU_H, MIN_W, MIN_H, clamp, maxRect } from "./wm";
import { prefersReducedMotion } from "./common";

const EASE = "cubic-bezier(.2,.8,.2,1)";
const DIRS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function dockTarget(app) {
  return (
    document.querySelector(`.th-os [data-dock-app="${app}"]`) || document.querySelector(".th-os [data-dock-tray]")
  );
}

export default function Window({ win, rank, active, vp, dispatch, setBusy, title, iconApp, dark, flush, children }) {
  const outerRef = useRef(null);
  const frameRef = useRef(null);
  const animRef = useRef(null);
  const cleanupRef = useRef(null);
  const busyRef = useRef(false); // closing / minimising in progress
  const prevMin = useRef(win.min);
  const prevMax = useRef(win.max);
  const mounted = useRef(false);

  const r = win.max ? maxRect(vp) : win;

  // Open animation: grow out of whatever launched the window.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || prefersReducedMotion() || win.min) return;
    let from = "translate(0, 12px) scale(.94)";
    if (win.origin) {
      const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
      from = `translate(${win.origin.x - c.x}px, ${win.origin.y - c.y}px) scale(.12)`;
    }
    const a = frame.animate(
      [
        { transform: from, opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: win.origin ? 320 : 220, easing: EASE }
    );
    return () => a.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore-from-dock animation and maximise transitions.
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const frame = frameRef.current;
    const reduce = prefersReducedMotion();
    if (prevMin.current && !win.min) {
      animRef.current?.cancel();
      animRef.current = null;
      busyRef.current = false;
      const t = dockTarget(win.app);
      if (t && !reduce) {
        const tc = centerOf(t);
        const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
        frame.animate(
          [
            { transform: `translate(${tc.x - c.x}px, ${tc.y - c.y}px) scale(.08)`, opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          { duration: 340, easing: EASE }
        );
      }
    }
    if (prevMax.current !== win.max && !reduce) {
      const el = outerRef.current;
      el.classList.add("os-win--snap");
      const t = setTimeout(() => el.classList.remove("os-win--snap"), 260);
      prevMin.current = win.min;
      prevMax.current = win.max;
      return () => clearTimeout(t);
    }
    prevMin.current = win.min;
    prevMax.current = win.max;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.min, win.max]);

  // Keep keyboard focus inside the active window.
  useEffect(() => {
    if (active && !win.min && outerRef.current && !outerRef.current.contains(document.activeElement)) {
      frameRef.current?.focus({ preventScroll: true });
    }
  }, [active, win.min]);

  useEffect(
    () => () => {
      cleanupRef.current?.();
      animRef.current?.cancel();
    },
    []
  );

  const requestClose = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    if (prefersReducedMotion()) return dispatch({ type: "close", id: win.id });
    const a = frameRef.current.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: "scale(.94)", opacity: 0 },
      ],
      { duration: 150, easing: "ease-in", fill: "forwards" }
    );
    animRef.current = a;
    a.onfinish = () => dispatch({ type: "close", id: win.id });
  };

  const requestMinimize = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    const t = dockTarget(win.app);
    if (prefersReducedMotion() || !t) return dispatch({ type: "minimize", id: win.id });
    const tc = centerOf(t);
    const c = centerOf(frameRef.current);
    const a = frameRef.current.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: `translate(${tc.x - c.x}px, ${tc.y - c.y}px) scale(.08)`, opacity: 0.2 },
      ],
      { duration: 360, easing: "cubic-bezier(.5,0,.75,.2)", fill: "forwards" }
    );
    animRef.current = a;
    a.onfinish = () => dispatch({ type: "minimize", id: win.id });
  };

  const toggleMax = () => dispatch({ type: "toggleMax", id: win.id });

  // Pointer tracking shared by drag + resize. DOM is written directly each frame,
  // React state is updated once on release.
  const track = (e, onMove, onEnd) => {
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    let raf = 0;
    let last = null;
    setBusy(true);
    const move = (ev) => {
      last = [ev.clientX - sx, ev.clientY - sy];
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          onMove(...last);
        });
    };
    const end = () => {
      cancelAnimationFrame(raf);
      if (last) onMove(...last);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      cleanupRef.current = null;
      setBusy(false);
      onEnd();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    cleanupRef.current = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  };

  const onTitleDown = (e) => {
    if (e.button !== 0 || win.max || e.target.closest("button")) return;
    const el = outerRef.current;
    const ox = win.x;
    const oy = win.y;
    let nx = ox;
    let ny = oy;
    el.classList.add("os-win--dragging");
    track(
      e,
      (dx, dy) => {
        nx = clamp(ox + dx, -(win.w - 120), vp.w - 120);
        ny = clamp(oy + dy, MENU_H, vp.h - 44);
        el.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
      },
      () => {
        el.classList.remove("os-win--dragging");
        if (nx !== ox || ny !== oy) dispatch({ type: "rect", id: win.id, x: nx, y: ny });
      }
    );
  };

  const onResizeDown = (dir) => (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const el = outerRef.current;
    const o = { x: win.x, y: win.y, w: win.w, h: win.h };
    let n = { ...o };
    track(
      e,
      (dx, dy) => {
        n = { ...o };
        if (dir.includes("e")) n.w = clamp(o.w + dx, MIN_W, vp.w - o.x - 4);
        if (dir.includes("s")) n.h = clamp(o.h + dy, MIN_H, vp.h - o.y - 4);
        if (dir.includes("w")) {
          const w = clamp(o.w - dx, MIN_W, o.x + o.w - 4);
          n.x = o.x + o.w - w;
          n.w = w;
        }
        if (dir.includes("n")) {
          const h = clamp(o.h - dy, MIN_H, o.y + o.h - MENU_H);
          n.y = o.y + o.h - h;
          n.h = h;
        }
        el.style.transform = `translate3d(${n.x}px, ${n.y}px, 0)`;
        el.style.width = `${n.w}px`;
        el.style.height = `${n.h}px`;
      },
      () => dispatch({ type: "rect", id: win.id, ...n })
    );
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape" && !e.defaultPrevented) {
      e.preventDefault();
      requestClose();
    }
  };

  const titleId = `os-wt-${win.id.replace(/[^a-z0-9-]/gi, "-")}`;

  return (
    <div
      ref={outerRef}
      className={`os-win${active ? " is-active" : ""}${win.max ? " is-max" : ""}${dark ? " is-dark" : ""}${win.min ? " is-min" : ""}`}
      style={{
        transform: `translate3d(${r.x}px, ${r.y}px, 0)`,
        width: r.w,
        height: r.h,
        zIndex: 100 + rank,
      }}
      inert={win.min || undefined}
      onPointerDownCapture={() => !active && dispatch({ type: "focus", id: win.id })}
      onFocusCapture={() => !active && dispatch({ type: "focus", id: win.id })}
    >
      <section
        ref={frameRef}
        className="os-win-frame"
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="os-win-title" onPointerDown={onTitleDown} onDoubleClick={(e) => !e.target.closest("button") && toggleMax()}>
          <span className="os-win-name">
            <AppIcon app={iconApp} size={18} />
            <span id={titleId}>{title}</span>
          </span>
          <span className="os-win-ctrls">
            <button type="button" className="os-wc os-wc--min" aria-label={`Minimise ${title}`} onClick={requestMinimize}>
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6h7" /></svg>
            </button>
            <button type="button" className="os-wc os-wc--max" aria-label={win.max ? `Restore ${title}` : `Maximise ${title}`} onClick={toggleMax}>
              <svg viewBox="0 0 12 12" aria-hidden="true">
                {win.max ? <path d="M3.5 4.5h4v4h-4zM4.5 3h4.5v4.5" /> : <rect x="2.75" y="2.75" width="6.5" height="6.5" rx="1" />}
              </svg>
            </button>
            <button type="button" className="os-wc os-wc--close" aria-label={`Close ${title}`} onClick={requestClose}>
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" /></svg>
            </button>
          </span>
        </header>
        <div className={`os-win-body${flush ? " is-flush" : ""}`}>{children}</div>
      </section>
      {!win.max &&
        DIRS.map((d) => <span key={d} className={`os-rz os-rz-${d}`} onPointerDown={onResizeDown(d)} aria-hidden="true" />)}
    </div>
  );
}
