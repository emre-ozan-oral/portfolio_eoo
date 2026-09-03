"use client";

import { useReveal } from "@/hooks/useReveal";
import { skillGroups } from "@/data/content";

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

export default function Skills() {
  const { ref, visible } = useReveal();

  return (
    <section id="skills" className="py-32 px-8 max-w-6xl mx-auto relative overflow-hidden">
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none leading-none text-[var(--text)] opacity-[0.03]"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(160px,22vw,260px)", fontWeight: 700 }}
        aria-hidden
      >03</div>

      <div ref={ref}>
        <div className={`reveal${visible ? " in-view" : ""}`}>
          <SectionHeader label="Technical Skills" />
        </div>

        <div
          className="mt-12 grid sm:grid-cols-3 gap-px"
          style={{ background: "var(--border)" }}
        >
          {skillGroups.map((group, gi) => (
            <div
              key={group.category}
              className={`reveal${visible ? " in-view" : ""} p-10 hover:bg-[var(--surface)] transition-colors duration-300`}
              style={{ background: "var(--bg)", transitionDelay: `${gi * 80}ms` }}
            >
              <h3
                className="text-[var(--accent)] text-[10px] tracking-[0.35em] uppercase mb-8"
                style={{ fontFamily: "var(--font-mono)" }}
              >{group.category}</h3>
              <ul className="space-y-4">
                {group.items.map((skill) => (
                  <li
                    key={skill}
                    className="text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-150 cursor-default text-[17px] leading-none"
                    style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
                  >{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
