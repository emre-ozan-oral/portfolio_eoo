import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MinesweeperTabs from "@/components/minesweeper/MinesweeperTabs";

export const metadata: Metadata = {
  title: "Minesweeper – Emre Ozan Oral",
  description: "A little Minesweeper, playable in three difficulties: beginner, intermediate, and expert.",
};

export default function MinesweeperPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-8 pt-36 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-5 mb-3">
            <span
              className="text-[var(--accent)] text-[11px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ——
            </span>
            <h1
              className="text-[28px] text-[var(--text)]"
              style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
            >
              Minesweeper
            </h1>
          </div>
          <p className="text-[var(--dim)] text-[13px] tracking-wide mb-14 max-w-md">
            A small side project — classic Minesweeper with beginner, intermediate, and
            expert boards. Click to clear, right-click (or Flag mode) to flag. Switch to
            &quot;Watch solver&quot; to see a constraint-satisfaction solver play a board from
            scratch, with its reasoning highlighted step by step.
          </p>

          <MinesweeperTabs />
        </div>
      </main>
      <Footer />
    </>
  );
}
