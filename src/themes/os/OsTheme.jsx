import { useCallback, useEffect, useRef, useState } from "react";
import { useFonts } from "../../shell/useFonts";
import { OsLogo } from "./AppIcon";
import Desktop from "./Desktop";
import Mobile from "./Mobile";
import { formatIST, prefersReducedMotion, useMediaQuery, useNow } from "./common";
import { profile, photos } from "../../data/portfolio";
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

// Painted wallpaper over the gradient fallback; fades (and gently settles) in once decoded.
function Wallpaper() {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) setLoaded(true);
  }, []);
  return (
    <div className="os-wallpaper" aria-hidden="true">
      <img
        ref={imgRef}
        className={`os-wallpaper-img${loaded ? " is-loaded" : ""}`}
        src={photos.os.wallpaper}
        srcSet={`${photos.os.wallpaperSm} 960w, ${photos.os.wallpaper} 1672w`}
        sizes="100vw"
        alt=""
        decoding="async"
        fetchpriority="high"
        onLoad={() => setLoaded(true)}
      />
      <span className="os-wallpaper-shade" />
      <span className="os-grain" />
    </div>
  );
}

// Lock screen shown once per session, right after the boot animation.
function Login({ onDone }) {
  const now = useNow();
  const [leaving, setLeaving] = useState(false);
  const btnRef = useRef(null);
  const go = useCallback(() => {
    setLeaving(true);
    setTimeout(onDone, 300);
  }, [onDone]);
  useEffect(() => {
    btnRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") return; // handled by the button / ignored
      go();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className={`os-login${leaving ? " is-leaving" : ""}`} role="dialog" aria-label="Log in to Reddy OS" onClick={go}>
      <time className="os-login-time" dateTime={now.toISOString()}>
        {formatIST(now, { hour: "numeric", minute: "2-digit", hour12: false })}
        <small>{formatIST(now, { weekday: "long", day: "numeric", month: "long" })}</small>
      </time>
      <div className="os-login-avatar">
        <img src={photos.os.avatar} alt="" width="132" height="132" />
      </div>
      <p className="os-login-name">{profile.nickname}</p>
      <button ref={btnRef} type="button" className="os-login-btn" onClick={(e) => (e.stopPropagation(), go())}>
        Log in as guest →
      </button>
      <p className="os-login-hint">Click anywhere or press any key</p>
    </div>
  );
}

export default function OsTheme({ page = "home" }) {
  useFonts("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap");
  const phone = useMediaQuery(PHONE_QUERY);
  const [booting, setBooting] = useState(shouldBoot);
  const [login, setLogin] = useState(booting);

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
      <Wallpaper />
      {booting ? <Boot onDone={done} /> : phone ? <Mobile page={page} /> : <Desktop page={page} />}
      {!booting && login && <Login onDone={() => setLogin(false)} />}
    </div>
  );
}
