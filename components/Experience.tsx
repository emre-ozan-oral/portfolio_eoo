"use client";

import { useReveal } from "@/hooks/useReveal";
import { jobs } from "@/data/content";

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

export default function Experience() {
  const { ref, visible } = useReveal();
  const cls = (delay: number) =>
    `reveal${visible ? " in-view" : ""}`;

  return (
    <section id="experience" className="py-32 px-8 max-w-6xl mx-auto relative overflow-hidden">
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none leading-none text-[#EDE9E0] opacity-[0.03]"
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
              className={`reveal${visible ? " in-view" : ""} group relative p-8 border border-[#1D1D21] bg-[#131315]/40 hover:bg-[#131315] hover:border-[#D4A847]/25 transition-all duration-300`}
              style={{ transitionDelay: `${idx * 90}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#D4A847] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h3
                    className="text-[#EDE9E0] text-xl mb-1.5"
                    style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
                  >{job.company}</h3>
                  <p
                    className="text-[#D4A847] text-[11px] tracking-[0.15em] uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >{job.role}</p>
                </div>
                <span
                  className="text-[#6A6670] text-[10px] tracking-[0.12em] uppercase mt-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >{job.period}</span>
              </div>
              <ul className="space-y-3">
                {job.bullets.map((b, i) => (
                  <li key={i} className="flex gap-4 text-[#8C8894] text-[14px] leading-relaxed">
                    <span className="text-[#D4A847]/50 mt-0.5 shrink-0 text-xs">—</span>
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
