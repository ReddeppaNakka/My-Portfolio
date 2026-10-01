import { profile, projects } from "../../../data/portfolio";
import { OsLogo } from "../AppIcon";
import { EXT, useOs } from "../common";

export function Readme() {
  const { openApp, mobile } = useOs();
  return (
    <div className="os-app os-readme">
      <h1 className="os-readme-h">Welcome to Reddy OS</h1>
      <p>
        This is {profile.name}'s portfolio, built as a small desktop operating system. Everything a recruiter needs is one
        or two clicks away:
      </p>
      <ul>
        <li>
          <button type="button" className="os-link" onClick={(e) => openApp("about", {}, e.currentTarget)}>About Me</button> — who I am, education and skills
        </li>
        <li>
          <button type="button" className="os-link" onClick={(e) => openApp("experience", {}, e.currentTarget)}>Experience</button> — internships, timeline
        </li>
        <li>
          <button type="button" className="os-link" onClick={(e) => openApp("projects", {}, e.currentTarget)}>Projects</button> — all {projects.length} projects with GitHub and live links
        </li>
        <li>
          <button type="button" className="os-link" onClick={(e) => openApp("resume", {}, e.currentTarget)}>Résumé.pdf</button> and{" "}
          <button type="button" className="os-link" onClick={(e) => openApp("contact", {}, e.currentTarget)}>Contact</button>
        </li>
      </ul>
      <h2 className="os-readme-h2">How to use it</h2>
      {mobile ? (
        <ul>
          <li>Tap an app on the home screen to open it. Use “‹ Home” to go back.</li>
          <li>The Terminal works too — tap a suggested command or type your own.</li>
        </ul>
      ) : (
        <ul>
          <li>Double-click a desktop icon (or select it and press Enter). The dock opens apps with one click.</li>
          <li>Drag windows by their title bar, resize from any edge, double-click the title bar to maximise.</li>
          <li><kbd>Esc</kbd> closes the focused window · <kbd>Ctrl</kbd>+<kbd>`</kbd> cycles windows.</li>
          <li>In the Terminal try <code>help</code>, <code>ls</code>, <code>open atlas</code> or <code>neofetch</code>. <kbd>Tab</kbd> autocompletes.</li>
        </ul>
      )}
      <h2 className="os-readme-h2">Prefer something simpler?</h2>
      <p>
        A cleaner, scrolling design is one click away: press <strong>Switch design</strong> in the bottom-right corner, or
        type <code>theme minimal</code> in the Terminal.
      </p>
    </div>
  );
}

export function OsInfo() {
  const repo = projects.find((p) => p.id === "portfolio");
  return (
    <div className="os-app os-osinfo">
      <div className="os-osinfo-logo">
        <OsLogo size={84} />
      </div>
      <h1 className="os-osinfo-name">Reddy OS</h1>
      <p className="os-muted">Version 4.0 · Portfolio edition</p>
      <dl className="os-osinfo-specs">
        <div><dt>Owner</dt><dd>{profile.name}</dd></div>
        <div><dt>Kernel</dt><dd>React 19 + Vite</dd></div>
        <div><dt>Windows</dt><dd>useReducer window manager, transform-based drag &amp; resize</dd></div>
        <div><dt>Shell</dt><dd>Hand-rolled terminal with history and Tab completion</dd></div>
        <div><dt>Location</dt><dd>{profile.location} (IST)</dd></div>
      </dl>
      {repo && (
        <a className="os-btn" href={repo.github} {...EXT}>
          View source on GitHub
        </a>
      )}
    </div>
  );
}
