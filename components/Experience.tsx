"use client";

import { useReveal } from "@/hooks/useReveal";
import { jobs } from "@/data/content";

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

export default function Experience() {
  const { ref, visible } = useReveal();
  const cls = (delay: number) =>
    `reveal${visible ? " in-view" : ""}`;

  return (
    <section id="experience" className="py-32 px-8 max-w-6xl mx-auto relative overflow-hidden">
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none leading-none text-[var(--text)] opacity-[0.03]"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(160px,22vw,260px)", fontWeight: 700 }}
        aria-hidden
      >01</div>

      <div ref={ref}>
        <div className={`reveal${visible ? " in-view" : ""}`}>
          <SectionHeader label="Work Experience" />
        </div>

        <div className="mt-12 space-y-4">
          {jobs.map((job, idx) => (
            <div
              key={job.company}
              className={`reveal${visible ? " in-view" : ""} group relative p-8 border border-[var(--border)] bg-[var(--surface)]/40 hover:bg-[var(--surface)] hover:border-[var(--accent)]/25 transition-all duration-300`}
              style={{ transitionDelay: `${idx * 90}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)] opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h3
                    className="text-[var(--text)] text-xl mb-1.5"
                    style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
                  >{job.company}</h3>
                  <p
                    className="text-[var(--accent)] text-[11px] tracking-[0.15em] uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >{job.role}</p>
                </div>
                <span
                  className="text-[var(--dim)] text-[10px] tracking-[0.12em] uppercase mt-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >{job.period}</span>
              </div>
              <ul className="space-y-3">
                {job.bullets.map((b, i) => (
                  <li key={i} className="flex gap-4 text-[var(--muted)] text-[14px] leading-relaxed">
                    <span className="text-[var(--accent)]/50 mt-0.5 shrink-0 text-xs">—</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
