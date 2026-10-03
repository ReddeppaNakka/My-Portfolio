import { useEffect, useRef, useState } from "react";

const HOT = "a, button, [role='button'], summary, label, select";
const NATIVE = "input, textarea, [contenteditable='true'], iframe, .ts-root";

/* Drives a custom cursor made of two elements: `dot` follows the pointer
   exactly, `ring` trails it. Classes toggled on both:
     is-on   pointer is inside the window
     is-hot  hovering something clickable
     is-down mouse button held
     is-native over a text field, iframe or the design switcher — themes should hide the custom
               cursor there and let the native one show
   `[data-cursor="Label"]` on an element exposes that label via the ring's
   `data-label` attribute (and adds `has-label`) — but only while the pointer
   is on the element itself or on its main link (`primary` selector), not on
   a smaller control inside it like a GitHub button.
   Only active for fine pointers; trailing is disabled under reduced motion. */
export function useFollowCursor({ lag = 0.18, primary = "" } = {}) {
  const dot = useRef(null);
  const ring = useRef(null);
  const [enabled] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.("(pointer: fine)").matches
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const k = reduced ? 1 : lag;
    const pos = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let raf = 0;
    let label = "";

    const both = (fn) => [dot.current, ring.current].forEach((el) => el && fn(el));
    const toggle = (cls, on) => both((el) => el.classList.toggle(cls, on));

    // What's under the pointer decides hot/native/label. Re-checked on scroll
    // too, since content moves under a still pointer.
    const inspect = (t) => {
      toggle("is-native", !!t?.closest(NATIVE));
      const hot = t?.closest(HOT);
      toggle("is-hot", !!hot);
      const owner = t?.closest("[data-cursor]");
      const onControl = hot && owner?.contains(hot) && !(primary && hot.matches(primary));
      const next = owner && !onControl ? owner.getAttribute("data-cursor") || "" : "";
      if (next !== label) {
        label = next;
        if (ring.current) ring.current.dataset.label = label;
        toggle("has-label", !!label);
      }
    };
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      toggle("is-on", true);
      inspect(e.target instanceof Element ? e.target : null);
    };
    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued || pos.x < 0) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        inspect(document.elementFromPoint(pos.x, pos.y));
      });
    };
    const onLeave = () => toggle("is-on", false);
    const onDown = () => toggle("is-down", true);
    const onUp = () => toggle("is-down", false);

    const tick = () => {
      trail.x += (pos.x - trail.x) * k;
      trail.y += (pos.y - trail.y) * k;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [enabled, lag, primary]);

  return { enabled, dot, ring };
}
