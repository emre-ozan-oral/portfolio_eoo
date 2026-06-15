import { FiLinkedin, FiMail, FiGithub } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-[#1D1D21] py-14 px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p
            className="text-[#EDE9E0] text-xl mb-1.5"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >Emre Ozan Oral</p>
          <p
            className="text-[#2A2A30] text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >{`© ${new Date().getFullYear()} · All rights reserved`}</p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/emre-ozan-oral-747840315/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2A2A30] hover:text-[#D4A847] transition-colors duration-200"
            aria-label="LinkedIn"
          ><FiLinkedin size={16} /></a>
          <a
            href="https://github.com/emreozanoral"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2A2A30] hover:text-[#D4A847] transition-colors duration-200"
            aria-label="GitHub"
          ><FiGithub size={16} /></a>
          <a
            href="mailto:oral.emreozan@gmail.com"
            className="text-[#2A2A30] hover:text-[#D4A847] transition-colors duration-200"
            aria-label="Email"
          ><FiMail size={16} /></a>
        </div>
      </div>
    </footer>
  );
}
