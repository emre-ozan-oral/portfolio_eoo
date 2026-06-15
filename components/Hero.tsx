"use client";

import { useEffect, useRef } from "react";
import { FiLinkedin, FiMail, FiGithub } from "react-icons/fi";
import NeuralNet from "./NeuralNet";

export default function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX - rect.left}px`;
        glowRef.current.style.top  = `${e.clientY - rect.top}px`;
      }
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-8 overflow-hidden"
    >
      <NeuralNet className="opacity-45" />

      <div
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,168,71,0.07) 0%, transparent 65%)",
          left: "50%",
          top: "50%",
          transition: "none",
        }}
      />

      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,168,71,0.04) 0%, transparent 60%)" }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #0C0C0D)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <p
          className="text-[#D4A847] text-[11px] tracking-[0.4em] uppercase mb-8 anim-fade-up"
          style={{ animationDelay: "0.1s", fontFamily: "var(--font-mono)" }}
        >
          Hi, I&apos;m
        </p>

        <h1
          className="leading-[0.88] font-bold text-[#EDE9E0] mb-8 anim-fade-up"
          style={{
            animationDelay: "0.2s",
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(72px, 13vw, 140px)",
            letterSpacing: "-0.02em",
          }}
        >
          Emre
          <br />
          <em className="text-[#D4A847] not-italic">Ozan</em>
          <br />
          Oral<span className="text-[#D4A847]">.</span>
        </h1>

        <p
          className="text-[#3A3840] text-lg tracking-[0.12em] uppercase mb-8 anim-fade-up"
          style={{ animationDelay: "0.35s", fontFamily: "var(--font-dm-sans)" }}
        >
          AI &amp; Software Engineer
        </p>

        <p
          className="max-w-md text-[#5C5860] leading-relaxed text-[15px] mb-12 anim-fade-up"
          style={{ animationDelay: "0.45s" }}
        >
          Computer Science student at Sabanci University specialising in
          multi-agent LLM systems and AI pipelines — building scalable,
          production-ready solutions with LangGraph, PyTorch, and modern
          evaluation frameworks.
        </p>

        <div
          className="flex flex-wrap gap-3 anim-fade-up"
          style={{ animationDelay: "0.58s" }}
        >
          <a
            href="https://www.linkedin.com/in/emre-ozan-oral-747840315/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#D4A847] text-[#D4A847] hover:bg-[#D4A847] hover:text-[#0C0C0D] transition-all duration-200"
            style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "10px 20px" }}
          >
            <FiLinkedin size={12} />
            LINKEDIN
          </a>
          <a
            href="mailto:oral.emreozan@gmail.com"
            className="flex items-center gap-2 border border-[#2A2A2F] text-[#3A3840] hover:border-[#5C5860] hover:text-[#EDE9E0] transition-all duration-200"
            style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "10px 20px" }}
          >
            <FiMail size={12} />
            EMAIL
          </a>
          <a
            href="https://github.com/emreozanoral"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#2A2A2F] text-[#3A3840] hover:border-[#5C5860] hover:text-[#EDE9E0] transition-all duration-200"
            style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "10px 20px" }}
          >
            <FiGithub size={12} />
            GITHUB
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-10 left-8 flex flex-col items-center gap-3 anim-fade-in"
        style={{ animationDelay: "1.1s" }}
      >
        <div className="w-px h-14 bg-gradient-to-b from-[#D4A847]/30 to-transparent" />
        <span
          className="text-[#2A2A2F] text-[9px] tracking-[0.3em] uppercase -rotate-90 mt-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
