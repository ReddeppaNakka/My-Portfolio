function Projects() {
  return (
    <section className="projects" id="projects">
      <h2>Projects</h2>

      <div className="project-cards">
        {/* Project 1 */}
        <div className="project-card">
          <div className="project-image">
            <img
              src="/projects/signature5.png"
              alt="Signature Verification using DenseNet"
            />
          </div>

          <div className="project-content">
            <h3>Signature Verification using DenseNet</h3>

            <p>
              Developed a deep learning–based signature verification system
              using DenseNet architecture to accurately distinguish between
              genuine and forged signatures. The project involved data
              preprocessing, model training, and performance evaluation using
              real-world datasets.
            </p>

            <div className="project-tags">
              <span>Deep Learning</span>
              <span>TensorFlow</span>
              <span>Computer Vision</span>
            </div>

            <div className="project-links">
              <a
                href="https://github.com/ReddeppaNakka/Signature-Verification-using-DensNET"
                target="_blank"
                rel="noopener noreferrer"
                className="github-btn"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Project 2 */}
        <div className="project-card">
          <div className="project-image">
            <img
              src="/projects/endometriosis.png"
              alt="Endometriosis Diagnosis using Machine Learning"
            />
          </div>

          <div className="project-content">
            <h3>Endometriosis Diagnosis using Machine Learning</h3>

            <p>
              Built a machine learning model to assist in the early diagnosis of
              endometriosis using histopathological image data. Focused on
              feature extraction, model optimization, and improving diagnostic
              accuracy through experimentation.
            </p>

            <div className="project-tags">
              <span>Machine Learning</span>
              <span>Python</span>
              <span>Healthcare</span>
            </div>

            <div className="project-links">
              <a
                href="https://github.com/ReddeppaNakka/Automated-Endometriosis-Detection-Using-Histopathological-Image-Data-with-a-Hybrid-CNNRNN-Model"
                target="_blank"
                rel="noopener noreferrer"
                className="github-btn"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Project 3 */}
        <div className="project-card">
          <div className="project-image">
            <img
              src="/projects/portfolio3.png"
              alt="Personal Portfolio Website"
            />
          </div>

          <div className="project-content">
            <h3>Personal Portfolio Website</h3>

            <p>
              Designed and developed a responsive personal portfolio website
              using React to showcase skills, projects, and experience. The site
              follows a component-based architecture with clean UI design and
              smooth user interactions.
            </p>

            <div className="project-tags">
              <span>React</span>
              <span>CSS</span>
              <span>Frontend</span>
            </div>

            <div className="project-links">
              <a
                href="https://github.com/ReddeppaNakka/Whatsapp_Web_clone_Frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="github-btn"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Projects;
