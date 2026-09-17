"use client";

import { FiCheck } from "react-icons/fi";
import { PlantedWord } from "./wendEngine";
import { SOLVED_COLORS } from "./WendBoard";

type WendWordCountsProps = {
  words: PlantedWord[];
  solvedIds: Set<number>;
};

/** The little row of length badges LinkedIn's Wend shows above the board —
 * one per word, ticking off as each is found, shortest first. */
export default function WendWordCounts({ words, solvedIds }: WendWordCountsProps) {
  const sorted = [...words].sort((a, b) => a.length - b.length);

  return (
    <div className="flex items-center gap-2">
      {sorted.map((w) => {
        const solved = solvedIds.has(w.id);
        return (
          <div
            key={w.id}
            title={solved ? w.text : `${w.length}-letter word`}
            className={`flex items-center justify-center w-9 h-9 border transition-colors duration-300 ${
              solved ? "anim-pop" : ""
            }`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              borderColor: solved ? "transparent" : "var(--border)",
              background: solved ? SOLVED_COLORS[w.id % SOLVED_COLORS.length] : "transparent",
              color: solved ? "var(--bg)" : "var(--dim)",
            }}
          >
            {solved ? <FiCheck size={14} /> : w.length}
          </div>
        );
      })}
    </div>
  );
}
