import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import QueensTabs from "@/components/queens/QueensTabs";

export const metadata: Metadata = {
  title: "Queens – Emre Ozan Oral",
  description: "An unlimited Queens puzzle — one queen per row, column, and color region, no two touching.",
};

export default function QueensPage() {
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
              Queens
            </h1>
          </div>
          <p className="text-[var(--dim)] text-[13px] tracking-wide mb-14 max-w-md">
            An unlimited take on LinkedIn&apos;s Queens — new puzzles generate on demand, no daily limit.
            Place one queen per row, column, and color region, with no two queens touching, even
            diagonally. Stuck? Tap Hint for the next logical step, on a cooldown so it stays a nudge.
            Switch to &quot;Watch solver&quot; to see the same rule-based solver play a puzzle from scratch.
          </p>

          <QueensTabs />
        </div>
      </main>
      <Footer />
    </>
  );
}
