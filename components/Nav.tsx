"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

const sectionLinks = [
  { label: "Experience", href: "#experience" },
  { label: "Projects",   href: "#projects" },
  { label: "Skills",     href: "#skills" },
  { label: "Education",  href: "#education" },
];

const gameLink = { label: "Sudoku", href: "/sudoku" };

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // From any page other than the homepage, section anchors need to route
  // back home first.
  const resolvedSectionLinks = sectionLinks.map((link) => ({
    ...link,
    href: onHome ? link.href : `/${link.href}`,
  }));

  const linkClass =
    "text-[11px] tracking-[0.18em] uppercase text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";
  const mobileLinkClass =
    "text-[13px] tracking-[0.18em] uppercase text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-[var(--bg)]/95 backdrop-blur-xl border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, var(--accent), transparent)" }}
        aria-hidden
      />
      <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-[var(--accent)] text-base transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-4"
          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          onClick={() => setOpen(false)}
        >
          EOO
        </Link>

        <ul className="hidden sm:flex items-center gap-8">
          {resolvedSectionLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClass} style={{ fontFamily: "var(--font-mono)" }}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href={gameLink.href}
              className={`${linkClass} ${pathname === gameLink.href ? "text-[var(--accent)]" : ""}`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {gameLink.label}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden text-[var(--text)] p-1 -mr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden border-t border-[var(--border)] px-8 py-6">
          <ul className="flex flex-col gap-5">
            {resolvedSectionLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href={gameLink.href}
                onClick={() => setOpen(false)}
                className={`${mobileLinkClass} ${pathname === gameLink.href ? "text-[var(--accent)]" : ""}`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {gameLink.label}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
