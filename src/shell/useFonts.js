import { useEffect } from "react";

// Loads a Google Fonts stylesheet once, the first time a theme mounts.
// Links stay in <head> after switching so revisiting a theme doesn't re-fetch.
export function useFonts(href) {
  useEffect(() => {
    if (!href || document.querySelector(`link[data-font="${href}"]`)) return;
    if (!document.querySelector('link[href="https://fonts.gstatic.com"]')) {
      const pre = document.createElement("link");
      pre.rel = "preconnect";
      pre.href = "https://fonts.gstatic.com";
      pre.crossOrigin = "";
      document.head.appendChild(pre);
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.font = href;
    document.head.appendChild(link);
  }, [href]);
}
