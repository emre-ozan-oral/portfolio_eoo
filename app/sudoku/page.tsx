import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SudokuGame from "@/components/sudoku/SudokuGame";

export const metadata: Metadata = {
  title: "Sudoku – Emre Ozan Oral",
  description: "A little 9x9 sudoku, playable in three difficulties: easy, normal, and hard.",
};

export default function SudokuPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-8 pt-36 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-5 mb-3">
            <span
              className="text-[#D4A847] text-[11px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ——
            </span>
            <h1
              className="text-[28px] text-[#EDE9E0]"
              style={{ fontFamily: "var(--font-playfair)", fontWeight: 600 }}
            >
              Sudoku
            </h1>
          </div>
          <p className="text-[#6A6670] text-[13px] tracking-wide mb-14 max-w-md">
            A small side project — a classic 9x9 sudoku with easy, normal, and hard
            difficulties. Click a cell, then type or tap a number.
          </p>

          <SudokuGame />
        </div>
      </main>
      <Footer />
    </>
  );
}
