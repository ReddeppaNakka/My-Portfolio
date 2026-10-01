import { useEffect, useRef } from "react";
import { useFonts } from "../../shell/useFonts";
import Home from "./Home";
import Archive from "./Archive";
import "./minimal.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";

// Soft radial light that trails the pointer. Fine pointers only, never under reduced motion.
function useSpotlight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add("is-on");
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => el.classList.remove("is-on");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

export default function MinimalTheme({ page = "home" }) {
  useFonts(FONTS);
  const spot = useRef(null);
  useSpotlight(spot);

  return (
    <div className="th-minimal">
      <div className="m-spotlight" ref={spot} aria-hidden="true" />
      <a className="m-skip" href="#m-content">
        Skip to content
      </a>
      {page === "archive" ? <Archive /> : <Home />}
    </div>
  );
}
