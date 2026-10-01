import { useEffect, useRef, useState } from "react";

// Ring + dot cursor for fine pointers only. The native cursor stays visible over
// links, buttons and form fields (see temple.css), so usability never suffers.
export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);
  const [enabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;
    const setVis = (v) => {
      if (v === visible) return;
      visible = v;
      ring.current?.classList.toggle("is-on", v);
      dot.current?.classList.toggle("is-on", v);
    };
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setVis(true);
      const hot = e.target.closest?.("a, button, [role='button'], input, textarea, select, label");
      ring.current?.classList.toggle("is-hot", !!hot);
    };
    const onLeave = () => setVis(false);
    const onDown = () => ring.current?.classList.add("is-down");
    const onUp = () => ring.current?.classList.remove("is-down");
    const tick = () => {
      const k = reduced ? 1 : 0.2;
      lag.x += (pos.x - lag.x) * k;
      lag.y += (pos.y - lag.y) * k;
      if (ring.current) ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <span ref={ring} className="tp-cursor-ring" aria-hidden="true" />
      <span ref={dot} className="tp-cursor-dot" aria-hidden="true" />
    </>
  );
}
