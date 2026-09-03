"use client";

import { useReveal } from "@/hooks/useReveal";
import { education, activities, interests } from "@/data/content";

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

export default function Education() {
  const { ref, visible } = useReveal();

  return (
    <section id="education" className="py-32 px-8 max-w-6xl mx-auto relative overflow-hidden">
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none leading-none text-[var(--text)] opacity-[0.03]"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(160px,22vw,260px)", fontWeight: 700 }}
        aria-hidden
      >04</div>

      <div ref={ref}>
        <div className={`reveal${visible ? " in-view" : ""}`}>
          <SectionHeader label="Education" />
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-4 mb-16">
          {education.map((edu, idx) => (
            <div
              key={edu.school}
              className={`reveal${visible ? " in-view" : ""} group relative p-8 border border-[var(--border)] bg-[var(--surface)]/40 hover:border-[var(--accent)]/20 hover:bg-[var(--surface)] transition-all duration-300`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)] opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
              <h3
                className="text-[var(--text)] text-xl mb-2"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
              >{edu.school}</h3>
              <p className="text-[var(--muted)] text-[13px] mb-3">{edu.degree}</p>
              {edu.period && (
                <p
                  className="text-[var(--dim)] text-[10px] tracking-[0.12em] mb-4"
                  style={{ fontFamily: "var(--font-mono)" }}
                >{edu.period}</p>
              )}
              <span
                className="text-[var(--accent)] text-[9px] tracking-[0.2em] uppercase border border-[var(--accent)]/30 px-3 py-1.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >{edu.note}</span>
            </div>
          ))}
        </div>

        <div
          className={`reveal${visible ? " in-view" : ""} grid sm:grid-cols-2 gap-12`}
          style={{ transitionDelay: "200ms" }}
        >
          <div>
            <h3
              className="text-[var(--accent)] text-[10px] tracking-[0.35em] uppercase mb-7"
              style={{ fontFamily: "var(--font-mono)" }}
            >Activities</h3>
            <ul className="space-y-3.5">
              {activities.map((a) => (
                <li key={a} className="flex gap-4 text-[var(--muted)] text-[13px] leading-relaxed">
                  <span className="text-[var(--accent)]/40 shrink-0 mt-px">—</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3
              className="text-[var(--accent)] text-[10px] tracking-[0.35em] uppercase mb-7"
              style={{ fontFamily: "var(--font-mono)" }}
            >Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <span
                  key={i}
                  className="text-[10px] tracking-[0.1em] px-3 py-1.5 border border-[var(--border)] text-[var(--dim)] hover:text-[var(--muted)] hover:border-[var(--dim)] transition-colors duration-150"
                  style={{ fontFamily: "var(--font-mono)" }}
                >{i}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
