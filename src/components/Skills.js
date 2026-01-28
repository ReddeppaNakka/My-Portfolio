import { useState } from "react";

/* Reusable Chevron SVG */
const ChevronIcon = () => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Skills() {
  const [activeCard, setActiveCard] = useState(null);

  const toggleCard = (index) => {
    setActiveCard(activeCard === index ? null : index);
  };

  return (
    <section className="skills" id="skills">
      <h2>Technical Expertise</h2>

      <div className="skill-cards">
        {/* Frontend */}
        <div
          className={`card ${activeCard === 0 ? "active" : ""}`}
          onClick={() => toggleCard(0)}
        >
          <div className="card-header">
            <h3>Frontend Development</h3>
            <span className="chevron">
              <ChevronIcon />
            </span>
          </div>

          <p>
            React, HTML, CSS, JavaScript, Bootstrap, Tailwind CSS, TypeScript,
            Figma
          </p>

          <div className="card-details">
            <p>
              ✔ Built dynamic UIs using React & Hooks <br />
              ✔ Designed responsive layouts with Bootstrap & Tailwind CSS <br />
              ✔ Wrote type-safe frontend code using TypeScript <br />
              ✔ Converted Figma designs into pixel-perfect UI <br />
              ✔ Optimized UI for performance and accessibility
            </p>
          </div>
        </div>

        {/* Backend */}
        <div
          className={`card ${activeCard === 1 ? "active" : ""}`}
          onClick={() => toggleCard(1)}
        >
          <div className="card-header">
            <h3>Backend Development</h3>
            <span className="chevron">
              <ChevronIcon />
            </span>
          </div>

          <p>
            Python, Django, Flask, FastAPI, Java, ASP.NET Core, PHP, MySQL,
            PostgreSQL
          </p>

          <div className="card-details">
            <p>
              ✔ Developed REST APIs using Django, Flask & FastAPI <br />
              ✔ Built backend services with Java & ASP.NET Core <br />
              ✔ Implemented server-side logic using PHP <br />
              ✔ Designed and managed databases with MySQL & PostgreSQL <br />
              ✔ Followed clean architecture and MVC principles
            </p>
          </div>
        </div>

        {/* AI / ML */}
        <div
          className={`card ${activeCard === 2 ? "active" : ""}`}
          onClick={() => toggleCard(2)}
        >
          <div className="card-header">
            <h3>AI / ML</h3>
            <span className="chevron">
              <ChevronIcon />
            </span>
          </div>

          <p>
            NumPy, Pandas, Scikit-Learn, XGBoost, TensorFlow, PyTorch,
            Matplotlib, Jupyter Notebook, Flask
          </p>

          <div className="card-details">
            <p>
              ✔ Performed data analysis using NumPy & Pandas <br />
              ✔ Built ML models with Scikit-Learn & XGBoost <br />
              ✔ Developed deep learning models using TensorFlow & PyTorch <br />
              ✔ Visualized insights using Matplotlib <br />
              ✔ Deployed ML models as APIs using Flask <br />
              ✔ Experimented and documented workflows in Jupyter Notebook
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Skills;
