"use client";

import { useReveal } from "@/hooks/useReveal";
import { projects } from "@/data/content";
import { FiGithub, FiExternalLink } from "react-icons/fi";

const tagStyle: Record<string, string> = {
  "Graduation Project": "text-[var(--accent)] border-[var(--accent)]/30",
  "Work Project":       "text-[var(--tag-work)] border-[var(--tag-work)]/30",
  "Personal Project":   "text-[var(--tag-personal)] border-[var(--tag-personal)]/30",
  "Academic Project":   "text-[var(--tag-academic)] border-[var(--tag-academic)]/30",
};

function SectionHeader({ label }: { label: string }) {
  return (
    <div>
      <div className="flex items-center gap-5">
        <span
          className="text-[var(--accent)] text-[11px] tracking-[0.35em] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >——</span>
        <h2
          className="text-[28px] text-[var(--text)]"
          style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
        >{label}</h2>
      </div>
      <div className="accent-rule mt-5" />
    </div>
  );
}

export default function Projects() {
  const { ref, visible } = useReveal();

  return (
    <section id="projects" className="py-32 px-8 max-w-6xl mx-auto relative overflow-hidden">
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none leading-none text-[var(--text)] opacity-[0.03]"
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
              className={`reveal${visible ? " in-view" : ""} group relative flex flex-col p-7 border border-[var(--border)] bg-[var(--surface)]/40 hover:bg-[var(--surface)] hover:border-[var(--accent)]/20 transition-all duration-300`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)] opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-start justify-between gap-3 mb-5">
                <span
                  className="text-[var(--dim)] text-[10px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >{String(idx + 1).padStart(2, "0")}</span>
                <span
                  className={`text-[9px] tracking-[0.18em] uppercase border px-2.5 py-1 ${tagStyle[p.tag]}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >{p.tag}</span>
              </div>

              <h3
                className="text-[var(--text)] text-[20px] mb-1 leading-tight"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
              >{p.name}</h3>
              <p className="text-[var(--dim)] text-[11px] tracking-wide mb-4">{p.subtitle}</p>

              <p className="text-[var(--muted)] text-[13px] leading-relaxed flex-1 mb-6">
                {p.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] tracking-[0.12em] px-2.5 py-1 border border-[var(--border)] text-[var(--dim)] group-hover:border-[var(--accent)]/15 group-hover:text-[var(--muted)] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >{t}</span>
                ))}
              </div>

              {(p.github || p.live) && (
                <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)]">
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <FiGithub size={12} />
                      Code
                    </a>
                  )}
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <FiExternalLink size={12} />
                      Live
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
