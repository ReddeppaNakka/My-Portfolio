import { useEffect, useRef, useState } from "react";
import { profile, socials } from "../../../data/portfolio";
import { socialIcon } from "../../../shell/icons";
import { EXT } from "../common";

export default function Contact() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (e) => {
    e.preventDefault();
    const s = subject.trim() || "Hello from your portfolio";
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(body)}`;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      const t = document.createElement("textarea");
      t.value = profile.email;
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      t.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <form className="os-app os-mail" onSubmit={send}>
      <div className="os-mail-bar">
        <button type="submit" className="os-btn os-btn--primary">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
          </svg>
          Send
        </button>
        <button type="button" className="os-btn" onClick={copy} aria-live="polite">
          {copied ? "Copied!" : "Copy email"}
        </button>
        <span className="os-mail-hint">Opens your mail app</span>
      </div>
      <div className="os-mail-field">
        <span className="os-mail-label">To:</span>
        <span className="os-mail-to">
          <span className="os-mail-avatar" aria-hidden="true">{profile.firstName[0]}</span>
          {profile.name} &lt;{profile.email}&gt;
        </span>
      </div>
      <label className="os-mail-field">
        <span className="os-mail-label">Subject:</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Let's talk about a role" />
      </label>
      <label className="os-mail-body">
        <span className="sr-only">Message</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Hi ${profile.firstName},\n\n`}
          rows={8}
        />
      </label>
      <div className="os-mail-foot">
        <p className="os-mail-foothead">Or find me on</p>
        <ul className="os-mail-socials">
          {socials.map((s) => {
            const Icon = socialIcon[s.id];
            return (
              <li key={s.id}>
                <a href={s.url} className="os-social" {...(s.id === "email" ? {} : EXT)}>
                  {Icon && <Icon size={16} />}
                  <span>
                    <strong>{s.label}</strong>
                    <small>{s.handle}</small>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <p className="os-muted">
          {profile.phone} · {profile.location}
        </p>
      </div>
    </form>
  );
}
