import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  profile,
  socials,
  experience,
  education,
  projects,
  skills,
  certifications,
} from "../../../data/portfolio";
import { THEMES } from "../../../shell/themes";
import { CATEGORY_LABEL, EXT, formatIST, useOs } from "../common";

const BOOTED_AT = Date.now();

const COMMANDS = [
  ["help", "list available commands"],
  ["about", "a short bio"],
  ["whoami", "name, role and location"],
  ["ls", "list projects (also: ls projects)"],
  ["open", "open <project-id | app>  e.g. open atlas"],
  ["projects", "projects with status and summary"],
  ["experience", "work history"],
  ["skills", "tech I work with"],
  ["certs", "certifications"],
  ["contact", "how to reach me"],
  ["socials", "GitHub, LinkedIn and more"],
  ["resume", "open the résumé PDF"],
  ["theme", "theme <minimal|temple|bento|os>  switch design"],
  ["neofetch", "system summary"],
  ["date", "current time in Hyderabad"],
  ["echo", "print text"],
  ["history", "previous commands"],
  ["clear", "clear the screen"],
];
const CMD_NAMES = [...COMMANDS.map((c) => c[0]), "sudo"];

const APP_ALIASES = {
  about: "about",
  projects: "projects",
  experience: "experience",
  terminal: "terminal",
  resume: "resume",
  "resume.pdf": "resume",
  certs: "certs",
  certificates: "certs",
  contact: "contact",
  mail: "contact",
  readme: "readme",
};

const LOGO = String.raw`
   ____           _     _
  |  _ \ ___  __| | __| |_   _
  | |_) / _ \/ _' |/ _' | | | |
  |  _ <  __/ (_| | (_| | |_| |
  |_| \_\___|\__,_|\__,_|\__, |
        ___  ____        |___/
       / _ \/ ___|
      | | | \___ \
      | |_| |___) |
       \___/|____/`;

const commonPrefix = (arr) =>
  arr.reduce((pre, s) => {
    let i = 0;
    while (i < pre.length && i < s.length && pre[i] === s[i]) i++;
    return pre.slice(0, i);
  });

function neofetch() {
        const mins = Math.max(1, Math.round((Date.now() - BOOTED_AT) / 60000));
        const rows = [
          ["OS", "Reddy OS 4.0 (portfolio edition)"],
          ["Host", profile.name],
          ["Role", `${profile.title} · ${profile.role}`],
          ["Location", profile.location],
          ["Uptime", `${mins} min`],
          ["Shell", "rsh 1.0"],
          ["Projects", `${projects.length} (${projects.filter((p) => p.status === "live").length} live)`],
          ["Experience", `${experience.length} internships`],
          ["Education", `${education.short}, ${education.score}`],
          ["Languages", skills[0].items.slice(0, 4).join(", ")],
          ["Backend", skills[1].items.slice(0, 3).join(", ")],
        ];
        return (
            <span className="os-t-neo">
              <span className="os-t-logo" aria-hidden="true">{LOGO.slice(1)}</span>
              <span>
                <span className="os-t-strong">reddy</span>@<span className="os-t-strong">os</span>
                {"\n"}
                <span className="os-t-dim">────────────────</span>
                {"\n"}
                {rows.map(([k, v]) => (
                  <span key={k}>
                    <span className="os-t-cmd">{k}</span>: {v}
                    {"\n"}
                  </span>
                ))}
                {"\n"}
                <span className="os-t-swatches" aria-hidden="true">
                  {["#f87171", "#fbbf24", "#34d399", "#5eead4", "#818cf8", "#e879f9"].map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </span>
              </span>
            </span>
        );
}

function Prompt() {
  return (
    <span className="os-t-prompt" aria-hidden="true">
      <span className="os-t-user">reddy@os</span>:<span className="os-t-path">~</span>$
    </span>
  );
}

function Welcome() {
  return (
    <>
      <span className="os-t-strong">Reddy OS shell</span> <span className="os-t-dim">rsh 1.0 · {profile.name}</span>
      {"\n"}Type <span className="os-t-cmd">help</span> to see what I can do, or try{" "}
      <span className="os-t-cmd">open atlas</span>.
    </>
  );
}

export default function Terminal({ active }) {
  const { openApp, mobile } = useOs();
  const [params, setParams] = useSearchParams();
  const keyRef = useRef(1);
  const [lines, setLines] = useState(() => [
    { k: -3, kind: "out", node: <Welcome /> },
    { k: -2, kind: "cmd", text: "neofetch" },
    { k: -1, kind: "out", node: neofetch() },
  ]);
  const [input, setInput] = useState("");
  const history = useRef([]);
  const hIndex = useRef(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (active && !mobile) inputRef.current?.focus({ preventScroll: true });
  }, [active, mobile]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const out = (node) => ({ k: keyRef.current++, kind: "out", node });

  const openProjectBtn = (p) => (
    <button type="button" className="os-t-link" onClick={(e) => openApp("project", { id: p.id }, e.currentTarget)}>
      {p.id}
    </button>
  );

  function run(raw) {
    const text = raw.trim();
    const [cmd = "", ...args] = text.split(/\s+/);
    const arg = args.join(" ");
    const c = cmd.toLowerCase();
    switch (c) {
      case "":
        return [];
      case "help":
        return [
          out(
            <>
              <span className="os-t-dim">Available commands</span>
              {"\n"}
              {COMMANDS.map(([n, d]) => (
                <span key={n} className="os-t-helprow">
                  <span className="os-t-cmd">{n.padEnd(11)}</span>
                  <span className="os-t-dim">{d}</span>
                  {"\n"}
                </span>
              ))}
              <span className="os-t-dim">Tip: Tab autocompletes, ↑/↓ walk history.</span>
            </>
          ),
        ];
      case "about":
        return [out(profile.about.join("\n\n"))];
      case "whoami":
        return [
          out(
            <>
              <span className="os-t-strong">{profile.name}</span> ({profile.nickname}){"\n"}
              {profile.title} — {profile.role}
              {"\n"}
              {profile.location} · <span className="os-t-ok">{profile.availability}</span>
            </>
          ),
        ];
      case "ls":
      case "dir": {
        if (arg && arg !== "projects" && arg !== "projects/" && arg !== "~")
          return [out(<span className="os-t-err">ls: cannot access '{arg}': No such file or directory</span>)];
        return [
          out(
            <>
              <span className="os-t-dim">projects/ — {projects.length} items (click one, or `open &lt;id&gt;`)</span>
              {"\n"}
              <span className="os-t-ls">
                {projects.map((p) => (
                  <span key={p.id} className={`os-t-lsitem${p.status === "live" ? " is-live" : ""}`}>
                    {openProjectBtn(p)}
                  </span>
                ))}
              </span>
            </>
          ),
        ];
      }
      case "projects":
        return [
          out(
            <>
              {projects.map((p) => (
                <span key={p.id}>
                  {openProjectBtn(p)}
                  {" ".repeat(Math.max(1, 14 - p.id.length))}
                  <span className={p.status === "live" ? "os-t-ok" : p.status === "in-progress" ? "os-t-warn" : "os-t-dim"}>
                    {`[${p.status}]`.padEnd(14)}
                  </span>
                  {p.name} <span className="os-t-dim">— {p.short}</span>
                  {"\n"}
                </span>
              ))}
            </>
          ),
        ];
      case "open": {
        if (!arg) return [out(<span className="os-t-err">usage: open &lt;project-id | app&gt; — try `ls`</span>)];
        const key = arg.toLowerCase();
        const p = projects.find((x) => x.id === key);
        if (p) {
          openApp("project", { id: p.id });
          return [out(<span className="os-t-ok">Opening {p.name}…</span>)];
        }
        if (APP_ALIASES[key]) {
          openApp(APP_ALIASES[key]);
          return [out(<span className="os-t-ok">Opening {key}…</span>)];
        }
        return [out(<span className="os-t-err">open: no such project or app '{arg}'. Try `ls`.</span>)];
      }
      case "experience":
        return [
          out(
            <>
              {experience.map((e) => (
                <span key={e.id}>
                  <span className="os-t-strong">{e.role}</span> @ <span className="os-t-cmd">{e.company}</span>
                  {"\n"}
                  <span className="os-t-dim">  {e.start} – {e.end} · {e.location}</span>
                  {"\n"}  {e.summary}
                  {"\n\n"}
                </span>
              ))}
              <span className="os-t-strong">{education.degree}</span>
              {"\n"}
              <span className="os-t-dim">  {education.school} · {education.start}–{education.end} · {education.score}</span>
            </>
          ),
        ];
      case "skills":
        return [
          out(
            <>
              {skills.map((g) => (
                <span key={g.group}>
                  <span className="os-t-cmd">{g.group.padEnd(11)}</span>
                  {g.items.join(", ")}
                  {"\n"}
                </span>
              ))}
            </>
          ),
        ];
      case "certs":
      case "certifications":
        return [
          out(
            <>
              {certifications.map((c) => (
                <span key={c.id}>
                  <span className="os-t-ok">✓</span> {c.name} <span className="os-t-dim">— {c.issuer}, {c.date}</span>
                  {"\n"}
                </span>
              ))}
            </>
          ),
        ];
      case "contact":
        return [
          out(
            <>
              email   <a className="os-t-link" href={`mailto:${profile.email}`}>{profile.email}</a>
              {"\n"}phone   {profile.phone}
              {"\n"}where   {profile.location}
              {"\n"}
              <span className="os-t-dim">`open contact` for a compose window, `socials` for profiles.</span>
            </>
          ),
        ];
      case "socials":
        return [
          out(
            <>
              {socials.map((s) => (
                <span key={s.id}>
                  {s.label.padEnd(10)}
                  <a className="os-t-link" href={s.url} {...(s.id === "email" ? {} : EXT)}>
                    {s.url.replace(/^mailto:/, "")}
                  </a>
                  {"\n"}
                </span>
              ))}
            </>
          ),
        ];
      case "resume":
      case "cv":
        openApp("resume");
        return [
          out(
            <>
              Opening résumé… <span className="os-t-dim">(direct link: </span>
              <a className="os-t-link" href={profile.resume} {...EXT}>{profile.resume}</a>
              <span className="os-t-dim">)</span>
            </>
          ),
        ];
      case "theme": {
        const ids = THEMES.map((t) => t.id);
        if (!arg)
          return [
            out(
              <>
                usage: theme &lt;{ids.join("|")}&gt;{"\n"}
                {THEMES.map((t) => (
                  <span key={t.id}>
                    {t.id === "os" ? <span className="os-t-ok">* </span> : "  "}
                    <span className="os-t-cmd">{t.id.padEnd(9)}</span>
                    <span className="os-t-dim">{t.name} — {t.blurb}</span>
                    {"\n"}
                  </span>
                ))}
              </>
            ),
          ];
        const id = arg.toLowerCase();
        if (!ids.includes(id)) return [out(<span className="os-t-err">theme: unknown design '{arg}'. Options: {ids.join(", ")}</span>)];
        if (id === "os") return [out("You're already running Reddy OS.")];
        const next = new URLSearchParams(params);
        next.set("theme", id);
        setParams(next);
        return [out(<span className="os-t-ok">Switching to {THEMES.find((t) => t.id === id).name}…</span>)];
      }
      case "date":
        return [
          out(
            `${formatIST(new Date(), {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })} IST (Asia/Kolkata)`
          ),
        ];
      case "echo":
        return [out(arg)];
      case "history":
        return [out(history.current.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join("\n") || "(empty)")];
      case "neofetch":
        return [out(neofetch())];
      case "sudo":
        return [
          out(
            <span className="os-t-warn">
              [sudo] password for reddy: ********{"\n"}
              reddy is not in the sudoers file. This incident will be reported… to the hiring manager.{"\n"}
              <span className="os-t-dim">(Root access is granted after the interview.)</span>
            </span>
          ),
        ];
      case "exit":
        return [out(<span className="os-t-dim">There is no escape. Try closing the window instead.</span>)];
      default:
        return [
          out(
            <span className="os-t-err">
              command not found: {cmd}. Type <span className="os-t-cmd">help</span> for a list.
            </span>
          ),
        ];
    }
  }

  const submit = (raw) => {
    const text = raw.trim();
    if (text) {
      if (history.current[history.current.length - 1] !== text) history.current.push(text);
    }
    hIndex.current = -1;
    if (text.toLowerCase() === "clear" || text.toLowerCase() === "cls") {
      setLines([]);
      setInput("");
      return;
    }
    const echo = { k: keyRef.current++, kind: "cmd", text: raw };
    const result = run(raw);
    setLines((ls) => [...ls, echo, ...result].slice(-400));
    setInput("");
  };

  const complete = () => {
    const parts = input.replace(/^\s+/, "").split(/\s+/);
    let pool;
    if (parts.length <= 1) pool = CMD_NAMES;
    else if (parts[0] === "open") pool = [...projects.map((p) => p.id), ...Object.keys(APP_ALIASES)];
    else if (parts[0] === "theme") pool = THEMES.map((t) => t.id);
    else if (parts[0] === "ls") pool = ["projects"];
    else return;
    const last = parts[parts.length - 1].toLowerCase();
    const matches = [...new Set(pool.filter((x) => x.startsWith(last)))];
    if (!matches.length) return;
    const head = parts.slice(0, -1).join(" ");
    const join = (w) => (head ? `${head} ${w}` : w);
    if (matches.length === 1) {
      setInput(join(matches[0]) + " ");
    } else {
      const pre = commonPrefix(matches);
      if (pre.length > last.length) setInput(join(pre));
      else
        setLines((ls) => [
          ...ls,
          { k: keyRef.current++, kind: "cmd", text: input },
          out(<span className="os-t-dim">{matches.join("   ")}</span>),
        ]);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      hIndex.current = hIndex.current < 0 ? h.length - 1 : Math.max(0, hIndex.current - 1);
      setInput(h[hIndex.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (hIndex.current < 0) return;
      hIndex.current += 1;
      if (hIndex.current >= h.length) {
        hIndex.current = -1;
        setInput("");
      } else setInput(h[hIndex.current]);
    } else if (e.key === "Escape" && input) {
      e.preventDefault(); // clear the line instead of closing the window
      setInput("");
    } else if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && (e.key === "c" || e.key === "C") && !window.getSelection()?.toString()) {
      e.preventDefault();
      setLines((ls) => [...ls, { k: keyRef.current++, kind: "cmd", text: input + "^C" }]);
      setInput("");
    }
  };

  const focusInput = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="os-app os-term" onClick={focusInput}>
      <div className="os-term-scroll" ref={scrollRef}>
        <div className="os-term-log" role="log" aria-live="polite" aria-label="Terminal output">
          {lines.map((l) =>
            l.kind === "cmd" ? (
              <div key={l.k} className="os-t-line">
                <Prompt /> <span className="os-t-typed">{l.text}</span>
              </div>
            ) : (
              <div key={l.k} className="os-t-line os-t-out">
                {l.node}
              </div>
            )
          )}
        </div>
        <div className="os-t-line os-t-input">
          <Prompt />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal command"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="send"
          />
        </div>
      </div>
      {mobile && (
        <div className="os-term-chips" role="group" aria-label="Suggested commands">
          <span>Try:</span>
          {["help", "ls", "open atlas", "whoami", "neofetch", "contact"].map((c) => (
            <button key={c} type="button" onClick={(e) => { e.stopPropagation(); submit(c); }}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
