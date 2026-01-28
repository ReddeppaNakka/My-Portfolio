import { useState, useEffect } from "react";

const roles = [
  "Machine Learning Engineer",
  "AI Developer",
  ".NET Full-Stack Developer",
  "Software Engineer",
  "Python Developer",
];

function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState(""); // ✅ FIX

  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timeout;

    if (!isDeleting) {
      // Typing
      if (charIndex < currentRole.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentRole.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, 100);
      } else {
        // Pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1200);
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentRole.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, 60);
      } else {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, roleIndex]);

  return (
    <section className="hero" id="home">
      <div className="hero-text">
        <h1>
          <span className="static-text">
            I am{" "}
            <span className="name">
              <span className="first-name">Reddeppa</span>{" "}
              <span className="last-name">Nakka</span>
            </span>
            <br />
            <span className="subtitle">and I am a</span>
          </span>

          <br />

          {/* Fixed-width container to avoid layout shift */}
          <span className="typing-container">
            <span className="typing-wrapper">
              <span className="rotating-text">{displayText}</span>
              <span className="cursor">|</span>
            </span>
          </span>
        </h1>

        <p>
          Building digital experiences that merge creativity with technology.
        </p>

        <div className="connect-buttons">
          <a href="mailto:reddeppanakka@gmail.com" className="connect-btn">
            Email Me
          </a>

          <a
            href="https://www.linkedin.com/in/reddeppa-nakka-01187a22a/"
            target="_blank"
            rel="noopener noreferrer"
            className="connect-btn outline"
          >
            LinkedIn
          </a>
          <a
            href={`${process.env.PUBLIC_URL}/Reddeppa_Nakka_Resume.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="connect-btn outline"
          >
            View Resume
          </a>
        </div>
      </div>

      <div className="hero-img">
        <div className="profile-card">
          <img src="/picture1.png" alt="Reddy Profile" />

          <div className="profile-info">
            <p className="hero-highlights">
              B.Tech CSE Graduate <br />
              India | Open to Opportunities
            </p>

            <div className="hero-tech">
              <span>Python</span>
              <span>Java</span>
              <span>HTML</span>
              <span>CSS</span>
              <span>JavaScript</span>
              <span>.NET</span>
              <span>React</span>
              <span>SQL</span>
              <span>AI</span>
              <span>Machine Learning</span>
              <span>APIs</span>
              <span>GitHub</span>
              <span>DBMS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
