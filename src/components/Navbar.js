function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <span className="first-name">Reddeppa</span>{" "}
        <span className="last-name">Nakka</span>
      </div>

      <ul>
        <li>
          <a href="#home">Home</a>
        </li>

        <li>
          <a href="#about">About</a>
        </li>

        <li>
          <a href="#skills">Skills</a>
        </li>

        <li>
          <a href="#experience">Experience</a>
        </li>

        <li>
          <a href="#certificates">Certificates</a>
        </li>

        <li>
          <a href="#projects">Projects</a>
        </li>

        <li>
          <a href="#contact">Contact</a>
        </li>

        {/* Resume Button */}
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
