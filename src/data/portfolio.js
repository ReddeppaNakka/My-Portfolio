// Single source of truth for every theme. Edit content here, never inside a theme.

export const profile = {
  name: "Reddeppa Nakka",
  firstName: "Reddeppa",
  lastName: "Nakka",
  nickname: "Reddy",
  title: "Software Engineer",
  role: "Python, Backend & AI/ML",
  tagline:
    "I build full-stack products, backend systems and AI pipelines that ship to production and get used.",
  location: "Hyderabad, India",
  availability: "Open to roles anywhere in India",
  relocation: "Based in Hyderabad, happy to relocate anywhere in India.",
  email: "reddeppanakka@gmail.com",
  phone: "+91 7330680121",
  resume: "/Reddeppa_Nakka_Resume.pdf",
  photo: "/photos/bento/work.webp",
  about: [
    "I'm a software engineer who works across the stack, with most of my energy going into backend systems and AI-powered products. I like problems where an LLM or ML model has to do real work inside a reliable system — with validation, fallbacks and a database that still makes sense a year later.",
    "Most recently I was an AI & Software Development Engineer Intern at Befach, where I owned most of the end-to-end development of an AI task platform that turns multilingual meeting transcripts into assignable tasks — now running in production. Before that I built FastAPI services at MAANG Technologies.",
    "Outside work I build things to understand how they work: an agentic travel recommender, a daily intelligence pipeline, an interactive DSA platform and a fully local voice agent. I graduated in Computer Science from RGUKT RK Valley in 2025.",
  ],
};

// Per-theme imagery. Originals live in /photos-src (not deployed).
export const photos = {
  temple: {
    hokage: "/photos/temple/hokage.webp",
    silhouette: "/photos/temple/hokage-silhouette.webp",
    scroll: "/photos/temple/scroll.webp",
  },
  minimal: {
    portrait: "/photos/minimal/portrait-a.webp",
    portraitAlt: "/photos/minimal/portrait-b.webp",
    candid: "/photos/minimal/candid.webp",
  },
  bento: {
    headshot: "/photos/bento/work.webp",
    fun: "/photos/bento/photo-fun.webp",
    avatar: "/photos/bento/avatar-3d.webp",
  },
  os: {
    avatar: "/photos/os/avatar-pixel.webp",
    wallpaper: "/photos/os/wallpaper.webp",
    wallpaperSm: "/photos/os/wallpaper-sm.webp",
    portrait: "/photos/os/portrait.webp",
    albums: [
      {
        id: "life",
        title: "Life",
        items: [
          { src: "/photos/os/desk.webp", name: "desk.jpg", caption: "Where the work happens" },
          { src: "/photos/os/teamwork.webp", name: "whiteboard.jpg", caption: "Walking the team through a system design" },
          { src: "/photos/os/outdoors.webp", name: "hyderabad.jpg", caption: "Sunset over Hyderabad" },
          { src: "/photos/os/portrait.webp", name: "me.jpg", caption: "Reddy" },
        ],
      },
      {
        id: "alter",
        title: "Alter egos",
        items: [
          { src: "/photos/os/grandmaster.webp", name: "grandmaster.png", caption: "The Grandmaster" },
          { src: "/photos/os/wizard.webp", name: "wizard.png", caption: "The Wizard" },
          { src: "/photos/os/cyberpunk.webp", name: "guardian.png", caption: "Cyberpunk Guardian" },
        ],
      },
    ],
  },
};

export const socials = [
  { id: "github", label: "GitHub", handle: "ReddeppaNakka", url: "https://github.com/ReddeppaNakka" },
  { id: "linkedin", label: "LinkedIn", handle: "reddeppa-nakka", url: "https://www.linkedin.com/in/reddeppa-nakka/" },
  { id: "email", label: "Email", handle: "reddeppanakka@gmail.com", url: "mailto:reddeppanakka@gmail.com" },
  { id: "whatsapp", label: "WhatsApp", handle: "Chat with me", url: "https://wa.me/917330680121" },
];

export const stats = [
  { value: "15+", label: "Projects built" },
  { value: "3", label: "Live in production" },
  { value: "3", label: "Internships" },
  { value: "8.5", label: "B.Tech CGPA" },
];

export const experience = [
  {
    id: "befach",
    role: "AI & Software Development Engineer Intern",
    company: "Befach 4X Pvt Ltd",
    url: "https://taskmanager.befach.com/",
    location: "Hyderabad, India",
    start: "May 2026",
    end: "Aug 2026",
    summary:
      "Owned most of the end-to-end development, in a two-person team, of an AI task execution platform that turns multilingual meeting transcripts into structured, assignable tasks — shipped to production.",
    highlights: [
      "Designed and built the Node.js/Express + SQL backend: REST APIs, relational schema, JWT auth with role-based access control, audit logging, real-time updates and automated approval workflows.",
      "Engineered an LLM task-extraction pipeline (Claude API) with schema-validated output — title, assignee, deadline, priority, ownership confidence — from code-mixed English/Hindi/Telugu transcripts, plus a rule-based fallback that keeps the service up when the model API is down.",
      "Added RAG, conversational and voice-enabled AI and natural-language deadline parsing; built the React + TypeScript client and customer-facing e-commerce flows with payments and search.",
    ],
    tech: ["Node.js", "Express", "SQL", "React", "TypeScript", "Claude API", "RAG", "JWT"],
  },
  {
    id: "maang",
    role: "Software Engineering Intern",
    company: "MAANG Technologies Pvt Ltd",
    url: null,
    location: "Remote",
    start: "May 2024",
    end: "Jan 2025",
    summary:
      "Built RESTful backend services in Python and FastAPI serving 500+ requests a day.",
    highlights: [
      "Designed endpoints with data validation and error handling for production FastAPI services.",
      "Optimised service logic and validation paths, cutting average API response time by 40% and feature delivery time by 30%.",
      "Shipped 3 major feature releases in 8 months in an agile team of 5+ engineers using a pull-request and code-review workflow.",
    ],
    tech: ["Python", "FastAPI", "REST APIs", "PostgreSQL", "Git", "Agile"],
  },
  {
    id: "pragyashal",
    role: "AI / ML Intern",
    company: "Pragyashal",
    url: null,
    location: "Remote · AICTE",
    start: "Jun 2024",
    end: "Aug 2024",
    summary:
      "Built and tuned machine-learning models on real-world datasets.",
    highlights: [
      "Improved model accuracy by 10% using Bayesian optimisation for hyperparameter search.",
      "Handled preprocessing, feature engineering and evaluation with precision, recall and confusion matrices.",
    ],
    tech: ["Python", "Scikit-learn", "TensorFlow", "Pandas", "NumPy"],
  },
];

export const education = {
  school: "Rajiv Gandhi University of Knowledge Technologies, RK Valley",
  short: "RGUKT RK Valley",
  degree: "B.Tech in Computer Science and Engineering",
  start: "2021",
  end: "2025",
  score: "CGPA 8.5 / 10",
};

// status: "live" | "complete" | "in-progress"
// category: "ai" | "fullstack" | "ml" | "frontend"
export const projects = [
  {
    id: "befach-tasks",
    name: "VoTask — Befach Task Manager",
    year: 2026,
    madeAt: "Befach",
    featured: true,
    status: "live",
    category: "ai",
    short: "AI meeting-to-task platform used by startups and small businesses.",
    description:
      "Turns multilingual meeting transcripts into structured, assignable tasks. An LLM extraction pipeline with schema-validated output and a deterministic fallback, a Node/Express backend with RBAC and audit logs, and a React + TypeScript client. Lead contributor — 229 of 255 commits.",
    tech: ["React", "TypeScript", "Node.js", "Express", "SQL", "Claude API", "RAG"],
    image: "/projects/befach-tasks.jpg",
    github: "https://github.com/Munidhar05/Task-Manager1",
    live: "https://taskmanager.befach.com/",
  },
  {
    id: "atlas",
    name: "Atlas — Agentic AI Travel Concierge",
    year: 2026,
    madeAt: "Personal",
    featured: true,
    status: "live",
    category: "ai",
    short: "Agentic travel recommender reasoning over budget, season and interests.",
    description:
      "A FastAPI service running a 5-stage LangChain workflow over 145 destinations in 66 countries. Routes LLM stages by difficulty (LLaMA 3.3 70B for reasoning, 3.1 8B for parsing) with automatic failover, and prices trips with live Amadeus data behind an estimator fallback.",
    tech: ["Python", "FastAPI", "LangChain", "Groq", "React", "Tailwind"],
    image: "/projects/atlas.jpg",
    github: "https://github.com/ReddeppaNakka/Treckgroq",
    live: "https://treckgroq-1.onrender.com/",
  },
  {
    id: "algorithmix",
    name: "Algorithmix",
    year: 2026,
    madeAt: "Personal",
    featured: true,
    status: "live",
    category: "fullstack",
    short: "Interactive platform for learning DSA in Python, visually.",
    description:
      "23 modules and 83 interactive lessons with 9 purpose-built visualisers (sorting, recursion, graphs, BSTs, sliding window…), a command palette, and a playground that runs real Python through a sandboxed FastAPI backend.",
    tech: ["Next.js", "TypeScript", "FastAPI", "Python", "Framer Motion"],
    image: "/projects/algorithmix.jpg",
    github: "https://github.com/ReddeppaNakka/DSA",
    live: "https://dsa-seven.vercel.app/",
  },
  {
    id: "newsfall",
    name: "Newsfall",
    year: 2026,
    madeAt: "Personal",
    featured: true,
    status: "live",
    category: "ai",
    short: "Evidence-linked technology intelligence pipeline.",
    description:
      "A daily 12-stage pipeline on GitHub Actions — ingest, normalise, embed, extract entities and claims, cluster, verify, score, brief — persisting to Postgres with pgvector. Every generated event links back to its evidence through a source-credibility registry and claim verification ladder.",
    tech: ["Python", "Next.js 15", "Supabase", "pgvector", "GitHub Actions", "LLMs"],
    image: "/projects/newsfall.jpg",
    github: "https://github.com/ReddeppaNakka/Newsfall",
    live: "https://newsfall.vercel.app/",
  },
  {
    id: "pulseai",
    name: "PulseAI",
    year: 2026,
    madeAt: "Personal",
    featured: true,
    status: "complete",
    category: "ai",
    short: "Agentic AI analyst that scans, ranks and briefs.",
    description:
      "Five orchestrated agents scan Hacker News, arXiv and tech RSS, remove noise, rank what matters and write a personalised briefing. Runs fully offline in deterministic mock mode, or live with Claude.",
    tech: ["Next.js", "TypeScript", "Claude API", "Prisma", "Recharts"],
    image: "/projects/pulseai.jpg",
    github: "https://github.com/ReddeppaNakka/Signal_IQ",
    live: null,
  },
  {
    id: "nova",
    name: "NOVA Voice Agent",
    year: 2026,
    madeAt: "Personal",
    featured: true,
    status: "complete",
    category: "ai",
    short: "Privacy-first, fully local multimodal voice agent.",
    description:
      "Listens, remembers, sees and acts on your computer with everything kept local: Whisper speech, Ollama reasoning, Piper TTS, semantic memory in SQLite, document RAG with citations, and a risk-levelled sandbox for every action.",
    tech: ["Python", "Whisper", "Ollama", "RAG", "SQLite", "PySide6"],
    image: null,
    github: "https://github.com/ReddeppaNakka/Voice_Agent",
    live: null,
  },
  {
    id: "vantage",
    name: "Vantage",
    year: 2026,
    madeAt: "Personal",
    featured: false,
    status: "in-progress",
    category: "fullstack",
    short: "AI career intelligence platform for seekers and recruiters.",
    description:
      "Ranks the handful of public openings worth your time and explains why. Seeker app, recruiter portal and admin console on Next.js 15, with a FastAPI backend and a token-driven design system.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Tailwind", "FastAPI"],
    image: "/projects/vantage.jpg",
    github: "https://github.com/ReddeppaNakka/Vantage",
    live: null,
  },
  {
    id: "portalscope",
    name: "PortalScope",
    year: 2026,
    madeAt: "Personal",
    featured: false,
    status: "in-progress",
    category: "fullstack",
    short: "Job postings pulled straight from employers' own career portals.",
    description:
      "Retrieves each posting from the applicant tracking system the employer actually publishes to and refuses to show anything it cannot trace back. 371 passing tests and an enforced architecture.",
    tech: ["TypeScript", "Node.js", "SQLite", "Cloudflare Workers"],
    image: null,
    github: "https://github.com/ReddeppaNakka/JobGenie",
    live: null,
  },
  {
    id: "the-system",
    name: "The System",
    year: 2026,
    madeAt: "Personal",
    featured: false,
    status: "in-progress",
    category: "frontend",
    short: "Solo Leveling-style DSA trainer.",
    description:
      "Thirteen gates, 54 concepts, ~280 LeetCode problems, an adaptive daily quest engine, spaced repetition, boss fights and an in-browser Python/JS scratchpad, with nine themes and seventeen backgrounds.",
    tech: ["TypeScript", "React", "CSS", "LocalStorage"],
    image: "/projects/the-system.jpg",
    github: "https://github.com/ReddeppaNakka/LogicLoom",
    live: null,
  },
  {
    id: "ascend",
    name: "Project Ascend",
    year: 2026,
    madeAt: "Personal",
    featured: false,
    status: "in-progress",
    category: "fullstack",
    short: "A personal-growth RPG for web and Android.",
    description:
      "Turns who you want to become into daily missions. A deterministic planner builds roadmaps and timetables; missed missions bring proportionate consequences. Offline-first, one codebase for web and Android.",
    tech: ["TypeScript", "React", "Capacitor", "Android"],
    image: "/projects/ascend.jpg",
    github: "https://github.com/ReddeppaNakka/Atherion",
    live: null,
  },
  {
    id: "endometriosis",
    name: "Endometriosis Diagnosis",
    year: 2025,
    madeAt: "RGUKT",
    featured: false,
    status: "complete",
    category: "ml",
    short: "Classical ML ensemble and CNN-RNN hybrid for diagnosis.",
    description:
      "A soft-voting ensemble (SVM + Gradient Boosting + Decision Tree) reaching 92.7% accuracy and 0.93 F1 on clinical data, plus a VGG16 + LSTM hybrid for 4-class histopathology classification on 3,300 images, served through Flask.",
    tech: ["Python", "Scikit-learn", "TensorFlow", "Keras", "Flask"],
    image: "/projects/endometriosis.png",
    github:
      "https://github.com/ReddeppaNakka/Automated-Endometriosis-Detection-Using-Histopathological-Image-Data-with-a-Hybrid-CNNRNN-Model",
    extraLinks: [
      {
        label: "Voting classifier repo",
        url: "https://github.com/ReddeppaNakka/Enhanced-Endometriosis-Diagnosis-with-Voting-Classifiers",
      },
    ],
    live: null,
  },
  {
    id: "signature",
    name: "Signature Verification",
    year: 2024,
    madeAt: "RGUKT",
    featured: false,
    status: "complete",
    category: "ml",
    short: "DenseNet169 model separating genuine from forged signatures.",
    description:
      "A deep-learning verification system built on DenseNet169 with preprocessing, training and evaluation on real signature datasets.",
    tech: ["Python", "TensorFlow", "Keras", "DenseNet169", "OpenCV"],
    image: "/projects/signature5.png",
    github: "https://github.com/ReddeppaNakka/Signature-Verification-using-DensNET",
    live: null,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Web Clone",
    year: 2025,
    madeAt: "Personal",
    featured: false,
    status: "complete",
    category: "frontend",
    short: "Responsive React recreation of the WhatsApp Web interface.",
    description:
      "Multi-panel layout, dynamic chat switching, message sending with simulated replies and profile updates, built with React hooks.",
    tech: ["React", "JavaScript", "CSS"],
    image: "/projects/whatsapp.jpg",
    github: "https://github.com/ReddeppaNakka/Whatsapp_Web_clone_Frontend",
    live: null,
  },
  {
    id: "portfolio",
    name: "This Portfolio",
    year: 2026,
    madeAt: "Personal",
    featured: false,
    status: "live",
    category: "frontend",
    short: "Four complete designs over one data layer, switchable live.",
    description:
      "One content file rendered by four independent themes — minimal, cinematic WebGL, neo-brutalist bento and a desktop OS — each code-split and remembered per visitor.",
    tech: ["React", "Vite", "Three.js", "GSAP", "CSS"],
    image: "/projects/portfolio3.png",
    github: "https://github.com/ReddeppaNakka/My-Portfolio",
    live: "https://reddeppa-portfolio.netlify.app/",
  },
];

export const skills = [
  { group: "Languages", items: ["Python", "JavaScript", "TypeScript", "Java", "SQL", "C#"] },
  { group: "Backend", items: ["FastAPI", "Node.js", "Express", "Flask", "REST APIs", "JWT Auth"] },
  { group: "AI / ML", items: ["LLM Integration", "LangChain", "RAG", "Embeddings", "Agentic AI", "TensorFlow", "Keras", "Scikit-learn", "OpenCV", "Pandas", "NumPy"] },
  { group: "Frontend", items: ["React", "Next.js", "Vite", "Tailwind CSS", "Three.js", "HTML", "CSS"] },
  { group: "Databases", items: ["PostgreSQL", "MySQL", "SQL Server", "SQLite", "MongoDB", "Supabase", "pgvector"] },
  { group: "Tools", items: ["Git", "GitHub Actions", "Docker", "Postman", "Linux", "Vercel", "Netlify", "Render"] },
];

// image: null when no scan is available yet — themes must handle that.
export const certifications = [
  { id: "iitp", name: "Artificial Intelligence & Machine Learning", issuer: "IIT Patna · Masai", date: "2025", note: "Certified course", image: null },
  { id: "nptel", name: "Cloud Computing", issuer: "NPTEL · IIT Madras", date: "2024", note: "Elite + Silver", image: "/certificates/NPTEL.png" },
  { id: "maang", name: "Software Engineering Intern — Experience Letter", issuer: "MAANG Technologies", date: "2025", note: "May 2024 – Jan 2025", image: "/certificates/maang.png" },
  { id: "pragyashal", name: "AICTE Internship — Machine Learning", issuer: "Pragyashal", date: "2024", note: "Internship certificate", image: "/certificates/pragyashal.png" },
  { id: "verzeo", name: "Machine Learning with Python", issuer: "Verzeo", date: "2022", note: "Internship certificate", image: "/certificates/verzeo.jpg" },
  { id: "codechef-silver", name: "25-Day Coding Streak", issuer: "CodeChef", date: "2024", note: "Silver streak badge", image: "/certificates/CodeChef1.png" },
  { id: "codechef-bronze", name: "5-Day Coding Streak", issuer: "CodeChef", date: "2024", note: "Bronze streak badge", image: "/certificates/CodeChef2.png" },
];

export const featuredProjects = projects.filter((p) => p.featured);
