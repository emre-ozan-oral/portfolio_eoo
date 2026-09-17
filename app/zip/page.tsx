import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ZipTabs from "@/components/zip/ZipTabs";

export const metadata: Metadata = {
  title: "Zip – Emre Ozan Oral",
  description: "An unlimited Zip puzzle — draw one path through every cell, hitting the numbers in order.",
};

export default function ZipPage() {
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
              Zip
            </h1>
          </div>
          <p className="text-[var(--dim)] text-[13px] tracking-wide mb-14 max-w-md">
            An unlimited take on LinkedIn&apos;s Zip — new puzzles generate on demand, no daily limit. Draw
            a single path that visits every cell exactly once, hitting the numbered cells in order,
            without crossing the thick walls. Tap Hint for the next forced step, on a cooldown. Switch to
            &quot;Watch solver&quot; to see the connectivity-based solver trace a route from scratch.
          </p>

          <ZipTabs />
        </div>
      </main>
      <Footer />
    </>
  );
}
