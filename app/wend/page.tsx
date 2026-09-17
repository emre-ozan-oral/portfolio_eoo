import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WendTabs from "@/components/wend/WendTabs";

export const metadata: Metadata = {
  title: "Wend – Emre Ozan Oral",
  description: "An unlimited Wend puzzle — trace every letter on the board into a set of hidden words.",
};

export default function WendPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-8 pt-36 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-5 mb-3">
            <span className="text-[var(--accent)] text-[11px] tracking-[0.35em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              ——
            </span>
            <h1 className="text-[28px] text-[var(--text)]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}>
              Wend
            </h1>
          </div>
          <p className="text-[var(--dim)] text-[13px] tracking-wide mb-14 max-w-md">
            An unlimited take on LinkedIn&apos;s Wend — new puzzles generate on demand, no daily limit.
            Trace adjacent letters into words; every letter on the board belongs to exactly one word, and
            dark cells are unused. Tap Hint to reveal the next letter of the easiest remaining word, on a
            cooldown. Switch to &quot;Watch solver&quot; to see every word get spelled out from scratch.
          </p>

          <WendTabs />
        </div>
      </main>
      <Footer />
    </>
  );
}
