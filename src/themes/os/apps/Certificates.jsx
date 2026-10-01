import { useEffect, useRef, useState } from "react";
import { certifications } from "../../../data/portfolio";

function CertCard({ cert, big = false }) {
  return (
    <div className={`os-certcard${big ? " is-big" : ""}`}>
      <svg viewBox="0 0 48 48" width={big ? 64 : 40} height={big ? 64 : 40} aria-hidden="true">
        <path d="M17 28l-4 15 6-2.5 3.5 5 3-11z" fill="#5eead4" />
        <path d="M31 28l4 15-6-2.5-3.5 5-3-11z" fill="#2dd4bf" />
        <circle cx="24" cy="20" r="12" fill="#fff" />
        <circle cx="24" cy="20" r="8" fill="none" stroke="#14b8a6" strokeWidth="2" />
        <path d="M24 15.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" fill="#f59e0b" />
      </svg>
      <strong>{cert.name}</strong>
      <span>{cert.issuer}</span>
      <em>{cert.note}</em>
    </div>
  );
}

function CertThumb({ cert }) {
  const [failed, setFailed] = useState(!cert.image);
  if (failed) return <CertCard cert={cert} />;
  return <img src={cert.image} alt={`${cert.name} certificate`} loading="lazy" onError={() => setFailed(true)} />;
}

export default function Certificates() {
  const [index, setIndex] = useState(-1);
  const viewerRef = useRef(null);
  const lastTrigger = useRef(null);
  const open = index >= 0;
  const cert = open ? certifications[index] : null;
  const withImages = certifications.filter((c) => c.image).length;

  useEffect(() => {
    if (open) viewerRef.current?.focus();
  }, [open]);

  const close = () => {
    setIndex(-1);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  };
  const step = (d) => setIndex((i) => (i + d + certifications.length) % certifications.length);

  const onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  };

  return (
    <div className="os-app os-photos">
      <div className="os-photos-scroll" inert={open || undefined}>
      <header className="os-photos-head">
        <h1 className="os-h1">Certificates</h1>
        <p className="os-muted">
          {certifications.length} items · {withImages} scans
        </p>
      </header>
      <ul className="os-photos-grid">
        {certifications.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className="os-photo"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setIndex(i);
              }}
              aria-label={`View ${c.name}, ${c.issuer}`}
            >
              <span className="os-photo-img">
                <CertThumb cert={c} />
              </span>
              <span className="os-photo-cap">
                <strong>{c.name}</strong>
                <span>
                  {c.issuer} · {c.date}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      </div>

      {open && (
        <div
          className="os-viewer"
          role="dialog"
          aria-label={`${cert.name} — ${cert.issuer}`}
          tabIndex={-1}
          ref={viewerRef}
          onKeyDown={onKey}
        >
          <div className="os-viewer-bar">
            <button type="button" className="os-btn os-btn--ghost" onClick={close}>
              ‹ All certificates
            </button>
            <span className="os-viewer-count">
              {index + 1} / {certifications.length}
            </span>
            <span className="os-viewer-nav">
              <button type="button" className="os-iconbtn" aria-label="Previous certificate" onClick={() => step(-1)}>‹</button>
              <button type="button" className="os-iconbtn" aria-label="Next certificate" onClick={() => step(1)}>›</button>
            </span>
          </div>
          <div className="os-viewer-stage">
            {cert.image ? <img src={cert.image} alt={`${cert.name} certificate`} /> : <CertCard cert={cert} big />}
          </div>
          <div className="os-viewer-cap">
            <strong>{cert.name}</strong>
            <span>
              {cert.issuer} · {cert.date} · {cert.note}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
