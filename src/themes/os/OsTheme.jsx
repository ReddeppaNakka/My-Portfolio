import { useEffect, useState } from "react";
import { useFonts } from "../../shell/useFonts";
import { OsLogo } from "./AppIcon";
import Desktop from "./Desktop";
import Mobile from "./Mobile";
import { prefersReducedMotion, useMediaQuery } from "./common";
import "./os.css";

const BOOT_KEY = "reddy-os-booted";
const PHONE_QUERY = "(max-width: 767px), (pointer: coarse) and (max-width: 1023px)";

function shouldBoot() {
  if (prefersReducedMotion()) return false;
  try {
    return sessionStorage.getItem(BOOT_KEY) !== "1";
  } catch {
    return true;
  }
}

function Boot({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    let t2;
    const finish = () => {
      setLeaving(true);
      t2 = setTimeout(onDone, 260);
    };
    const t1 = setTimeout(finish, 1200);
    const skip = () => {
      clearTimeout(t1);
      finish();
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <div className={`os-boot${leaving ? " is-leaving" : ""}`} role="status" aria-label="Reddy OS is starting">
      <OsLogo size={72} className="os-boot-logo" />
      <p className="os-boot-name">Reddy OS</p>
      <div className="os-boot-bar" aria-hidden="true">
        <span />
      </div>
      <p className="os-boot-hint">Click or press any key to skip</p>
    </div>
  );
}

export default function OsTheme({ page = "home" }) {
  useFonts("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap");
  const phone = useMediaQuery(PHONE_QUERY);
  const [booting, setBooting] = useState(shouldBoot);

  const done = useState(() => () => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* storage blocked — boot will simply replay next time */
    }
    setBooting(false);
  })[0];

  return (
    <div className="th-os">
      <div className="os-wallpaper" aria-hidden="true">
        <span className="os-blob os-blob--a" />
        <span className="os-blob os-blob--b" />
        <span className="os-blob os-blob--c" />
        <span className="os-blob os-blob--d" />
        <span className="os-grain" />
      </div>
      {booting ? <Boot onDone={done} /> : phone ? <Mobile page={page} /> : <Desktop page={page} />}
    </div>
  );
}
