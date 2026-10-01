import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_THEME, THEMES } from "./themes";

const STORAGE_KEY = "portfolio-theme";
const isValid = (id) => THEMES.some((t) => t.id === id);

const readStored = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isValid(v) ? v : null;
  } catch {
    return null;
  }
};

const store = (id) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* private mode — URL still carries the choice */
  }
};

// Priority: ?theme= in the URL (shareable) > last choice > default.
export function useTheme() {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get("theme");
  const theme = isValid(fromUrl) ? fromUrl : readStored() || DEFAULT_THEME;

  useEffect(() => {
    store(theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback(
    (id) => {
      if (!isValid(id)) return;
      const next = new URLSearchParams(params);
      next.set("theme", id);
      setParams(next);
      window.scrollTo(0, 0);
    },
    [params, setParams]
  );

  return [theme, setTheme];
}
