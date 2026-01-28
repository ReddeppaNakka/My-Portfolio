function Certificates() {
  return (
    <section className="certificates" id="certificates">
      <h2>Certifications & Achievements</h2>

      <div className="certificate-grid">
        {/* CodeChef Silver */}
        <div className="certificate-card">
          <img
            src="/certificates/CodeChef1.png"
            alt="CodeChef Silver Streak Badge"
            className="badge"
          />
          <h3>25 Days Coding Streak</h3>
          <p>CodeChef</p>
          <span>Silver Streak Badge</span>
        </div>

        {/* CodeChef Bronze */}
        <div className="certificate-card">
          <img
            src="/certificates/CodeChef2.png"
            alt="CodeChef Bronze Streak Badge"
            className="badge"
          />
          <h3>5 Days Coding Streak</h3>
          <p>CodeChef</p>
          <span>Bronze Streak Badge</span>
        </div>

        {/* MAANG Experience Letter */}
        <div className="certificate-card">
          <a
            href="/certificates/maang.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/certificates/maang.png"
              alt="MAANG Technologies Experience Letter"
            />
          </a>
          <h3>Technical Intern – Experience Letter</h3>
          <p>MAANG Technologies Pvt. Ltd.</p>
          <span>May 2024 – Jan 2025</span>
        </div>

        {/* NPTEL Certificate */}
        <div className="certificate-card">
          <a
            href="/certificates/NPTEL.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/certificates/NPTEL.png"
              alt="NPTEL Cloud Computing Certificate"
            />
          </a>
          <h3>Cloud Computing</h3>
          <p>NPTEL · IIT Madras</p>
          <span>Elite + Silver</span>
        </div>

        {/* Pragyashal Internship */}
        <div className="certificate-card">
          <a
            href="/certificates/pragyashal.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/certificates/pragyashal.png"
              alt="Pragyashal AICTE Internship Certificate"
            />
          </a>
          <h3>AICTE Internship – Machine Learning</h3>
          <p>Pragyashal</p>
          <span>2024</span>
        </div>

        {/* Verzeo Internship */}
        <div className="certificate-card">
          <a
            href="/certificates/verzeo.jpg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/certificates/verzeo.jpg"
              alt="Verzeo Machine Learning Internship Certificate"
            />
          </a>
          <h3>Machine Learning with Python</h3>
          <p>Verzeo</p>
          <span>2022</span>
        </div>
      </div>
    </section>
  );
}

export default Certificates;
