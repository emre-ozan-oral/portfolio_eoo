// ─── Personal ────────────────────────────────────────────────────────────────

export const personal = {
  name: "Emre Ozan Oral",
  highlight: "Ozan",           // part of name rendered in gold
  tagline: "AI & Software Engineer",
  bio: "Computer Science student at Sabanci University specialising in multi-agent LLM systems and AI pipelines — building scalable, production-ready solutions with LangGraph, PyTorch, and modern evaluation frameworks.",
  email: "oral.emreozan@gmail.com",
  linkedin: "https://www.linkedin.com/in/emre-ozan-oral-747840315/",
  github: "https://github.com/emre-ozan-oral",
  photo: "/photo.jpg",
};

// ─── Experience ───────────────────────────────────────────────────────────────

export const jobs = [
  {
    company: "Promake AI",
    role: "AI Developer (Part-Time)",
    period: "Sep 2025 – Dec 2025",
    bullets: [
      "Designed and implemented a multi-agent LLM system for automated website generation using LangGraph",
      "Built agent orchestration pipelines with tool integration and dynamic routing",
      "Developed scalable prompt workflows for structured website creation",
    ],
  },
  {
    company: "SESTEK",
    role: "AI R&D Intern",
    period: "Jun 2025 – Aug 2025",
    bullets: [
      "Built and evaluated LLM-based multi-agent systems using LangGraph and DeepEval",
      "Implemented agent-based pipelines with open-source LLM tools (Ollama, Groq)",
      "Conducted evaluation experiments to measure agent performance and reliability",
    ],
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────

export type ProjectTag = "Graduation Project" | "Work Project" | "Personal Project" | "Academic Project";

export const projects: {
  name: string;
  subtitle: string;
  tag: ProjectTag;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}[] = [
  {
    name: "InfoGuide",
    subtitle: "RAG-Based AI Information Retrieval System",
    tag: "Graduation Project",
    description:
      "End-to-end RAG system for financial knowledge retrieval. Full pipeline including document ingestion, preprocessing, embedding generation, and vector indexing (FAISS / ANN). Scalable benchmarking with HPC infrastructure (SLURM, GPU parallelisation).",
    tech: ["Python", "LangChain", "FAISS", "RAG", "SLURM", "PyTorch"],
  },
  {
    name: "AI Website Builder",
    subtitle: "Multi-Agent LLM System",
    tag: "Work Project",
    description:
      "LLM-based system generating complete websites using coordinated agents. Supervisor-agent architecture for task routing, integrated tools, and dynamic prompts for structured HTML/CSS output.",
    tech: ["LangGraph", "Python", "OpenAI", "Multi-Agent"],
  },
  {
    name: "AI Super Resolution",
    subtitle: "Deep Learning Image Upscaling",
    tag: "Academic Project",
    description:
      "Deep learning model for neural network-based image upscaling. Full training pipeline in PyTorch with custom image datasets and loss functions.",
    tech: ["PyTorch", "Python", "Deep Learning", "Computer Vision"],
  },
  {
    name: "Hospital Appointment App",
    subtitle: "Android Mobile Application",
    tag: "Academic Project",
    description:
      "Mobile app for hospital appointment scheduling with scheduling logic and data handling. Built collaboratively using OOP principles and agile practices.",
    tech: ["Java", "Android", "OOP"],
  },
];

// ─── Skills ──────────────────────────────────────────────────────────────────

export const skillGroups = [
  {
    category: "Languages",
    items: ["Python", "C++", "C#", "Java", "Verilog"],
  },
  {
    category: "AI / ML",
    items: ["PyTorch", "LangChain", "LangGraph", "DeepEval", "Scikit-Learn"],
  },
  {
    category: "Tools",
    items: ["Git", "Docker", "Ollama", "OpenAI API", "FAISS", "SLURM"],
  },
];

// ─── Education ───────────────────────────────────────────────────────────────

export const education = [
  {
    school: "Sabanci University",
    degree: "B.Sc. Computer Science",
    period: "Sep 2021 – Jun 2026",
    note: "Full Scholarship",
  },
  {
    school: "Sirri Yircali Anatolian High School",
    degree: "High School Diploma",
    period: "",
    note: "Extra English & German",
  },
];

export const activities = [
  "Computer Science Society – Sabanci University",
  "Game Development Club – Sabanci University",
];

export const interests = [
  "Artificial Intelligence",
  "Robotics",
  "Cars & Automotive Tech",
  "Game Development",
  "Music",
  "Swimming",
];
