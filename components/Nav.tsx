"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "Experience", href: "#experience" },
  { label: "Projects",   href: "#projects" },
  { label: "Skills",     href: "#skills" },
  { label: "Education",  href: "#education" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0C0C0D]/95 backdrop-blur-xl border-b border-[#1D1D21]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
        <a
          href="#hero"
          className="text-[#D4A847] text-base transition-opacity hover:opacity-60"
          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
        >
          EOO
        </a>
        <ul className="flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[11px] tracking-[0.18em] uppercase text-[#5C5860] hover:text-[#EDE9E0] transition-colors duration-200"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
