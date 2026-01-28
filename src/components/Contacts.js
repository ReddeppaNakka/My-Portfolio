function Contact() {
  const copyEmail = () => {
    navigator.clipboard.writeText("reddeppanakka@gmail.com");
    alert("Email copied to clipboard!");
  };

  return (
    <section className="contact" id="contact">
      <h2>Let’s Connect</h2>

      <div className="contact-cards">
        {/* Email */}
        <div className="contact-card">
          <span className="contact-icon">
            {/* Mail SVG */}
            <svg viewBox="0 0 24 24">
              <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 6l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>

          <div className="contact-info">
            <h3>Email</h3>
            <p>reddeppanakka@gmail.com</p>
            <button className="copy-btn" onClick={copyEmail}>
              Copy Email
            </button>
          </div>
        </div>

        {/* GitHub */}
        <a
          href="https://github.com/ReddeppaNakka"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card"
        >
          <span className="contact-icon">
            {/* GitHub SVG */}
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.1 6.8 9.4.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1-.9-1.3-.9-1.3-.7-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.7 1.3 1.9.9 2.3.7.1-.5.3-.9.6-1.1-2.2-.3-4.5-1.1-4.5-4.8 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.7-2.3 4.5-4.5 4.8.3.3.7.8.7 1.7v2.5c0 .3.2.6.7.5A10 10 0 0022 12c0-5.5-4.5-10-10-10z"
                fill="currentColor"
              />
            </svg>
          </span>

          <div className="contact-info">
            <h3>GitHub</h3>
            <p>github.com/ReddeppaNakka</p>
          </div>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/reddeppa-nakka-01187a22a/"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card"
        >
          <span className="contact-icon">
            {/* LinkedIn SVG */}
            <svg viewBox="0 0 24 24">
              <path d="M4 4h4v16H4zM6 2a2 2 0 110 4 2 2 0 010-4zM10 8h4v2c.6-1 1.7-2 3.5-2 3.7 0 4.5 2.4 4.5 5.5V20h-4v-6c0-1.5 0-3.4-2-3.4s-2.3 1.6-2.3 3.3V20h-4z" fill="currentColor"/>
            </svg>
          </span>

          <div className="contact-info">
            <h3>LinkedIn</h3>
            <p>linkedin.com/in/nakka-reddeppa</p>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/917330680121"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card whatsapp"
        >
          <span className="contact-icon">
            {/* WhatsApp SVG */}
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z"
                fill="currentColor"
              />
            </svg>
          </span>

          <div className="contact-info">
            <h3>WhatsApp</h3>
            <p>Chat with me</p>
          </div>
        </a>
      </div>
    </section>
  );
}

export default Contact;
