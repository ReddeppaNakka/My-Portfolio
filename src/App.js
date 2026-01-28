import Navbar from "./components/Navbar";
import Skills from "./components/Skills";
import About from "./components/About";
import Experience from "./components/Experience";
import Hero from "./components/Hero";
import Contact from "./components/Contacts";
import Projects from "./components/Projects";
import Certificates from "./components/Certificates";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Certificates />
      <Projects />
      <Contact />
    </>
  );
}

export default App;

