import { FiLinkedin, FiMail, FiGithub } from "react-icons/fi";
import { personal } from "@/data/content";

export default function Footer() {
  return (
    <footer className="border-t border-[#1D1D21] py-14 px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p
            className="text-[#EDE9E0] text-xl mb-1.5"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >{personal.name}</p>
          <p
            className="text-[#6A6670] text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >{`© ${new Date().getFullYear()} · All rights reserved`}</p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6A6670] hover:text-[#D4A847] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
            aria-label="LinkedIn"
          ><FiLinkedin size={16} /></a>
          <a
            href="https://github.com/emre-ozan-oral"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6A6670] hover:text-[#D4A847] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
            aria-label="GitHub"
          ><FiGithub size={16} /></a>
          <a
            href={`mailto:${personal.email}`}
            className="text-[#6A6670] hover:text-[#D4A847] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
            aria-label="Email"
          ><FiMail size={16} /></a>
        </div>
      </div>
    </footer>
  );
}
