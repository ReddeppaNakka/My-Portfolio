import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "./shell/useTheme";
import { getTheme } from "./shell/themes";
import ThemeSwitcher from "./shell/ThemeSwitcher";

function App() {
  const [themeId, setTheme] = useTheme();
  const { pathname } = useLocation();
  const page = pathname.startsWith("/archive") ? "archive" : "home";
  const Theme = getTheme(themeId).component;

  return (
    <>
      <Suspense fallback={<div className="shell-loading" aria-label="Loading design" />}>
        <Theme key={themeId} page={page} />
      </Suspense>
      <ThemeSwitcher current={themeId} onChange={setTheme} />
    </>
  );
}

export default App;
