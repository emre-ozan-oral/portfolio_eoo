"use client";

import { useReveal } from "@/hooks/useReveal";

const projects = [
  {
    name: "InfoGuide",
    subtitle: "RAG-Based AI Information Retrieval System",
    tag: "Graduation Project",
    description: "End-to-end RAG system for financial knowledge retrieval. Full pipeline including document ingestion, preprocessing, embedding generation, and vector indexing (FAISS / ANN). Scalable benchmarking with HPC infrastructure (SLURM, GPU parallelisation).",
    tech: ["Python", "LangChain", "FAISS", "RAG", "SLURM", "PyTorch"],
  },
  {
    name: "AI Website Builder",
    subtitle: "Multi-Agent LLM System",
    tag: "Work Project",
    description: "LLM-based system generating complete websites using coordinated agents. Supervisor-agent architecture for task routing, integrated tools, and dynamic prompts for structured HTML/CSS output.",
    tech: ["LangGraph", "Python", "OpenAI", "Multi-Agent"],
  },
  {
    name: "AI Super Resolution",
    subtitle: "Deep Learning Image Upscaling",
    tag: "Personal Project",
    description: "Deep learning model for neural network-based image upscaling. Full training pipeline in PyTorch with custom image datasets and loss functions.",
    tech: ["PyTorch", "Python", "Deep Learning", "Computer Vision"],
  },
  {
    name: "Hospital Appointment App",
    subtitle: "Android Mobile Application",
    tag: "Academic Project",
    description: "Mobile app for hospital appointment scheduling with scheduling logic and data handling. Built collaboratively using OOP principles and agile practices.",
    tech: ["Java", "Android", "OOP"],
  },
];

const tagStyle: Record<string, string> = {
  "Graduation Project": "text-[#D4A847] border-[#D4A847]/30",
  "Work Project":       "text-[#7EB8D4] border-[#7EB8D4]/30",
  "Personal Project":   "text-[#7ED4A8] border-[#7ED4A8]/30",
  "Academic Project":   "text-[#5C5860] border-[#5C5860]/30",
};

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5">
      <span
        className="text-[#D4A847] text-[11px] tracking-[0.35em] uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >——</span>
      <h2
        className="text-[28px] text-[#EDE9E0]"
        style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
      >{label}</h2>
    </div>
  );
}

export default function Projects() {
  const { ref, visible } = useReveal();

  return (
    <section id="projects" className="py-32 px-8 max-w-6xl mx-auto relative overflow-hidden">
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none leading-none text-[#EDE9E0] opacity-[0.03]"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(160px,22vw,260px)", fontWeight: 700 }}
        aria-hidden
      >02</div>

      <div ref={ref}>
        <div className={`reveal${visible ? " in-view" : ""}`}>
          <SectionHeader label="Projects" />
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {projects.map((p, idx) => (
            <div
              key={p.name}
              className={`reveal${visible ? " in-view" : ""} group flex flex-col p-7 border border-[#1D1D21] bg-[#131315]/40 hover:bg-[#131315] hover:border-[#D4A847]/20 transition-all duration-300`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <span
                  className="text-[#2A2A30] text-[10px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >{String(idx + 1).padStart(2, "0")}</span>
                <span
                  className={`text-[9px] tracking-[0.18em] uppercase border px-2.5 py-1 ${tagStyle[p.tag]}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >{p.tag}</span>
              </div>

              <h3
                className="text-[#EDE9E0] text-[20px] mb-1 leading-tight"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
              >{p.name}</h3>
              <p className="text-[#2A2A30] text-[11px] tracking-wide mb-4">{p.subtitle}</p>

              <p className="text-[#5C5860] text-[13px] leading-relaxed flex-1 mb-6">
                {p.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] tracking-[0.12em] px-2.5 py-1 border border-[#1D1D21] text-[#3A3840] group-hover:border-[#D4A847]/15 group-hover:text-[#5C5860] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
