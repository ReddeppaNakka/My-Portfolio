import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="first-name">Reddeppa</span>{" "}
        <span className="last-name">Nakka</span>
      </div>

      {/* Hamburger */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        <span />
        <span />
        <span />
      </div>

      <ul className={open ? "nav-links open" : "nav-links"}>
        {["home","about","skills","experience","certificates","projects","contact"].map(item => (
          <li key={item}>
            <a href={`#${item}`} onClick={() => setOpen(false)}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </a>
          </li>
        ))}

        <li>
          <a
            href={`${process.env.PUBLIC_URL}/Reddeppa_Nakka_Resume.pdf`}
            className="resume-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
