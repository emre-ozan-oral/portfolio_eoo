"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiLinkedin, FiMail, FiGithub, FiDownload, FiCheck } from "react-icons/fi";
import NeuralNet from "./NeuralNet";
import { personal } from "@/data/content";

export default function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

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

  const copyEmail = () => {
    navigator.clipboard.writeText(personal.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 min-w-0">
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
            {personal.name.split(" ").map((word, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {word === personal.highlight
                  ? <em className="text-[#D4A847] not-italic">{word}</em>
                  : i === personal.name.split(" ").length - 1
                    ? <>{word}<span className="text-[#D4A847]">.</span></>
                    : word}
              </span>
            ))}
          </h1>

          <p
            className="text-[#5C5860] text-lg tracking-[0.12em] uppercase mb-8 anim-fade-up"
            style={{ animationDelay: "0.35s", fontFamily: "var(--font-dm-sans)" }}
          >
            {personal.tagline}
          </p>

          <p
            className="max-w-md text-[#5C5860] leading-relaxed text-[15px] mb-12 anim-fade-up"
            style={{ animationDelay: "0.45s" }}
          >
            {personal.bio}
          </p>

          <div
            className="flex flex-wrap gap-3 anim-fade-up"
            style={{ animationDelay: "0.58s" }}
          >
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[#D4A847] text-[#D4A847] hover:bg-[#D4A847] hover:text-[#0C0C0D] transition-all duration-200"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "10px 20px" }}
            >
              <FiLinkedin size={12} />
              LINKEDIN
            </a>

            <button
              onClick={copyEmail}
              className="flex items-center gap-2 border border-[#2A2A2F] text-[#3A3840] hover:border-[#5C5860] hover:text-[#EDE9E0] transition-all duration-200 cursor-pointer"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "10px 20px" }}
            >
              {copied ? <FiCheck size={12} className="text-[#D4A847]" /> : <FiMail size={12} />}
              {copied ? <span className="text-[#D4A847]">COPIED</span> : "EMAIL"}
            </button>

            <a
              href={personal.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[#2A2A2F] text-[#3A3840] hover:border-[#5C5860] hover:text-[#EDE9E0] transition-all duration-200"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "10px 20px" }}
            >
              <FiGithub size={12} />
              GITHUB
            </a>

            <a
              href="/CV.pdf"
              download
              className="flex items-center gap-2 border border-[#2A2A2F] text-[#3A3840] hover:border-[#5C5860] hover:text-[#EDE9E0] transition-all duration-200"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", padding: "10px 20px" }}
            >
              <FiDownload size={12} />
              RESUME
            </a>
          </div>
        </div>

        <div className="flex-shrink-0 anim-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="relative w-[336px] h-[336px] lg:w-[432px] lg:h-[432px]">
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(212,168,71,0.12) 0%, transparent 70%)", transform: "scale(1.2)" }}
            />
            <Image
              src={personal.photo}
              alt={personal.name}
              width={432}
              height={432}
              className="rounded-full object-cover w-full h-full relative z-10"
              style={{ objectPosition: "center 15%" }}
              priority
            />
            <div
              className="absolute inset-0 rounded-full pointer-events-none z-20"
              style={{ boxShadow: "0 0 0 1px rgba(212,168,71,0.3), 0 0 60px rgba(212,168,71,0.06)" }}
            />
          </div>
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

      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300"
        style={{ opacity: copied ? 1 : 0, transform: `translateX(-50%) translateY(${copied ? "0" : "8px"})` }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5 border border-[#D4A847]/30 bg-[#131315]"
          style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", color: "#D4A847" }}
        >
          <FiCheck size={10} />
          EMAIL COPIED TO CLIPBOARD
        </div>
      </div>
    </section>
  );
}
