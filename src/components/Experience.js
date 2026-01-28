function Experience() {
  return (
    <section className="experience" id="experience">
      <h2>Experience</h2>

      <div className="experience-cards">
        {/* Experience 1 */}
        <div className="experience-card">
          <div className="experience-header">
            <h3>AI / ML Intern</h3>
            <span className="duration">Jun 2024 – Aug 2024</span>
          </div>

          <span className="company">Pragyashal</span>

          <ul>
            <li>
              Built and optimized machine learning models for real-world datasets,
              improving overall model accuracy by <strong>10%</strong> using
              Bayesian optimization techniques.
            </li>
            <li>
              Performed data preprocessing, feature engineering, and model
              evaluation using Python and Scikit-learn.
            </li>
            <li>
              Analyzed model performance using metrics such as accuracy, precision,
              recall, and confusion matrices.
            </li>
            <li>
              Gained hands-on experience in translating theoretical ML concepts
              into practical, deployable solutions.
            </li>
          </ul>

          <div className="experience-tags">
            <span>Python</span>
            <span>Machine Learning</span>
            <span>Data Preprocessing</span>
            <span>Numpy</span>
            <span>Pandas</span>
            <span>Scikit-learn</span>
            <span>TensorFlow</span>
            <span>Bayesian Optimization</span>
          </div>
        </div>

        {/* Experience 2 */}
        <div className="experience-card">
          <div className="experience-header">
            <h3>Technical Intern</h3>
            <span className="duration">Jan 2024 – Mar 2024</span>
          </div>

          <span className="company">MAANG Technologies</span>

          <ul>
            <li>
              Worked on backend development tasks, focusing on API integration and
              secure data handling practices.
            </li>
            <li>
              Assisted in designing and testing RESTful APIs to support frontend
              application features.
            </li>
            <li>
              Followed secure coding standards and participated in code reviews to
              improve application reliability.
            </li>
            <li>
              Collaborated with senior developers in an agile environment, gaining
              exposure to real-world software development workflows.
            </li>
          </ul>

          <div className="experience-tags">
            <span>Backend Development</span>
            <span>RESTful API Design</span>
            <span>API Integration</span>
            <span>Backend</span>
            <span>Security</span>
            <span>API Testing</span>
            <span>Agile Methodologies</span>
            <span>Team Collaboration</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Experience;
