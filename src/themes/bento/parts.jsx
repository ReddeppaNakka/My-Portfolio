import { useEffect, useRef, useState } from "react";

export const FILLS = ["yellow", "coral", "blue", "mint", "lilac"];

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function initials(name) {
  const base = name.split(/\s+[—-]\s+/)[0].trim();
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export const ext = { target: "_blank", rel: "noopener noreferrer" };

/* Project cover: screenshot when it exists, otherwise a generated poster tile. */
export function Cover({ project, index = 0, eager = false }) {
  const [failed, setFailed] = useState(!project.image);
  const fill = FILLS[index % FILLS.length];
  const pattern = ["dots", "stripes", "grid", "checks"][index % 4];
  return (
    <div className={`bt-cover bt-cover--gen bt-fill-${fill} bt-pat-${pattern}`}>
      <span className="bt-cover-ini" aria-hidden="true">{initials(project.name)}</span>
      <span className="bt-cover-tech" aria-hidden="true">{project.tech.slice(0, 3).join(" / ")}</span>
      {!failed && (
        <img
          className="bt-cover-img"
          src={project.image}
          alt={`Screenshot of ${project.name}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function StatusSticker({ status }) {
  if (status === "live")
    return (
      <span className="bt-sticker bt-sticker--live">
        LIVE <span className="bt-live-dot" aria-hidden="true">●</span>
      </span>
    );
  if (status === "in-progress") return <span className="bt-sticker bt-sticker--wip">WIP</span>;
  return <span className="bt-sticker bt-sticker--done">Shipped</span>;
}

/* Live clock in the visitor-independent Asia/Kolkata zone. */
export function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const tz = "Asia/Kolkata";
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  const secs = new Intl.DateTimeFormat("en-GB", { timeZone: tz, second: "2-digit" }).format(now).padStart(2, "0");
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(now));
  const awake = hour >= 8 && hour < 23;
  return (
    <>
      <div className="bt-label">My time</div>
      <div className="bt-clock" aria-label={`${time} in India`}>
        <time dateTime={now.toISOString()}>{time}</time>
        <span className="bt-clock-s" aria-hidden="true">:{secs}</span>
      </div>
      <div className="bt-clock-meta">
        <span>{date}</span>
        <span>IST · UTC+5:30</span>
      </div>
      <div className="bt-clock-note">{awake ? "Probably at the keyboard" : "Probably asleep — I'll reply soon"}</div>
    </>
  );
}

export function Marquee({ items, reduced }) {
  const row = (hidden) => (
    <ul className="bt-mq-row" aria-hidden={hidden || undefined}>
      {items.map((s, i) => (
        <li key={s + i}>
          <span>{s}</span>
          <span className="bt-mq-star" aria-hidden="true">✱</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`bt-mq${reduced ? " is-static" : ""}`}>
      <div className="bt-mq-track">
        {row(false)}
        {!reduced && row(true)}
      </div>
    </div>
  );
}

export function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    setCopied(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setCopied(false), 2200);
  };
  return (
    <div className="bt-copy">
      <a className="bt-copy-mail" href={`mailto:${email}`}>{email}</a>
      <button type="button" className={`bt-btn bt-btn--ink${copied ? " is-done" : ""}`} onClick={copy}>
        {copied ? "Copied!" : "Copy email"}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? "Email copied to clipboard" : ""}</span>
    </div>
  );
}

/* Pointer-follow tilt for fine pointers only; no-op under reduced motion. */
export function useTilt(reduced) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);
  return ref;
}
