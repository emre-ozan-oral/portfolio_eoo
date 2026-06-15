"use client";

import { useReveal } from "@/hooks/useReveal";

const education = [
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

const activities = [
  "Computer Science Society – Sabanci University",
  "Game Development Club – Sabanci University",
];

const interests = [
  "Artificial Intelligence",
  "Robotics",
  "Cars & Automotive Tech",
  "Game Development",
  "Music",
  "Swimming",
];

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

export default function Education() {
  const { ref, visible } = useReveal();

  return (
    <section id="education" className="py-32 px-8 max-w-6xl mx-auto relative overflow-hidden">
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none leading-none text-[#EDE9E0] opacity-[0.03]"
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
              className={`reveal${visible ? " in-view" : ""} p-8 border border-[#1D1D21] bg-[#131315]/40 hover:border-[#D4A847]/20 hover:bg-[#131315] transition-all duration-300`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <h3
                className="text-[#EDE9E0] text-xl mb-2"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
              >{edu.school}</h3>
              <p className="text-[#5C5860] text-[13px] mb-3">{edu.degree}</p>
              {edu.period && (
                <p
                  className="text-[#2A2A30] text-[10px] tracking-[0.12em] mb-4"
                  style={{ fontFamily: "var(--font-mono)" }}
                >{edu.period}</p>
              )}
              <span
                className="text-[#D4A847] text-[9px] tracking-[0.2em] uppercase border border-[#D4A847]/30 px-3 py-1.5"
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
              className="text-[#D4A847] text-[10px] tracking-[0.35em] uppercase mb-7"
              style={{ fontFamily: "var(--font-mono)" }}
            >Activities</h3>
            <ul className="space-y-3.5">
              {activities.map((a) => (
                <li key={a} className="flex gap-4 text-[#5C5860] text-[13px] leading-relaxed">
                  <span className="text-[#D4A847]/40 shrink-0 mt-px">—</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3
              className="text-[#D4A847] text-[10px] tracking-[0.35em] uppercase mb-7"
              style={{ fontFamily: "var(--font-mono)" }}
            >Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <span
                  key={i}
                  className="text-[10px] tracking-[0.1em] px-3 py-1.5 border border-[#1D1D21] text-[#3A3840] hover:text-[#5C5860] hover:border-[#2A2A30] transition-colors duration-150"
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
