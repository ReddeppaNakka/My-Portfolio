import { useEffect, useRef, useState } from "react";
import { photos } from "../../../data/portfolio";

const ALBUMS = photos.os.albums;

export default function Photos() {
  const [albumId, setAlbumId] = useState(ALBUMS[0].id);
  const [index, setIndex] = useState(-1);
  const viewerRef = useRef(null);
  const lastTrigger = useRef(null);
  const album = ALBUMS.find((a) => a.id === albumId);
  const items = album.items;
  const open = index >= 0;
  const item = open ? items[index] : null;
  const total = ALBUMS.reduce((n, a) => n + a.items.length, 0);

  useEffect(() => {
    if (open) viewerRef.current?.focus();
  }, [open]);

  const close = () => {
    setIndex(-1);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  };
  const step = (d) => setIndex((i) => (i + d + items.length) % items.length);

  const onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  };

  return (
    <div className="os-app os-photos os-gallery">
      <div className="os-photos-scroll" inert={open || undefined}>
        <header className="os-photos-head">
          <h1 className="os-h1">Photos</h1>
          <p className="os-muted">{total} photos</p>
        </header>
        <div className="os-albums" role="tablist" aria-label="Albums">
          {ALBUMS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={a.id === albumId}
              className={a.id === albumId ? "is-on" : undefined}
              onClick={() => setAlbumId(a.id)}
            >
              {a.title} <span>{a.items.length}</span>
            </button>
          ))}
        </div>
        <ul className={`os-photos-grid${album.id === "alter" ? " is-tall" : ""}`}>
          {items.map((p, i) => (
            <li key={p.src}>
              <button
                type="button"
                className="os-photo"
                onClick={(e) => {
                  lastTrigger.current = e.currentTarget;
                  setIndex(i);
                }}
                aria-label={`View ${p.caption}`}
              >
                <span className="os-photo-img">
                  <img src={p.src} alt={p.caption} loading="lazy" decoding="async" />
                </span>
                <span className="os-photo-cap">
                  <strong>{p.name}</strong>
                  <span>{p.caption}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div className="os-viewer" role="dialog" aria-label={item.caption} tabIndex={-1} ref={viewerRef} onKeyDown={onKey}>
          <div className="os-viewer-bar">
            <button type="button" className="os-btn os-btn--ghost" onClick={close}>
              ‹ {album.title}
            </button>
            <span className="os-viewer-count">
              {index + 1} / {items.length}
            </span>
            <span className="os-viewer-nav">
              <button type="button" className="os-iconbtn" aria-label="Previous photo" onClick={() => step(-1)}>‹</button>
              <button type="button" className="os-iconbtn" aria-label="Next photo" onClick={() => step(1)}>›</button>
            </span>
          </div>
          <div className="os-viewer-stage">
            <img src={item.src} alt={item.caption} />
          </div>
          <div className="os-viewer-cap">
            <strong>{item.name}</strong>
            <span>{item.caption}</span>
          </div>
        </div>
      )}
    </div>
  );
}
