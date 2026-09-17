"use client";

import { Marks } from "./queensEngine";

export type CellHighlight = "source" | "target" | "conflict";

type QueensBoardProps = {
  n: number;
  regions: number[][];
  marks: Marks;
  cellPx: number;
  interactive?: boolean;
  onCellClick?: (r: number, c: number) => void;
  highlights?: Record<string, CellHighlight>;
  conflicts?: Set<string>;
  dimmed?: boolean;
};

// A fixed, print-distinguishable palette so regions read clearly in both
// light and dark themes; cycles if a puzzle ever needs more than this many.
const REGION_COLORS = [
  "#E4A0A0",
  "#A9C4EB",
  "#B7D9A8",
  "#F0CB8E",
  "#C7AEDD",
  "#9FD8D0",
  "#EAAFC8",
  "#D5CBA0",
  "#A8B7E0",
  "#E3B08E",
];

const HIGHLIGHT_OUTLINE: Record<CellHighlight, string> = {
  source: "2px solid var(--accent)",
  target: "2px solid var(--tag-personal)",
  conflict: "2px solid var(--error)",
};

export default function QueensBoard({
  n,
  regions,
  marks,
  cellPx,
  interactive = false,
  onCellClick,
  highlights,
  conflicts,
  dimmed = false,
}: QueensBoardProps) {
  return (
    <div
      className={`inline-grid border-2 border-[var(--accent)]/40 select-none ${dimmed ? "opacity-90" : ""}`}
      style={{ gridTemplateColumns: `repeat(${n}, ${cellPx}px)` }}
    >
      {marks.map((row, r) =>
        row.map((mark, c) => {
          const cellKey = `${r},${c}`;
          const region = regions[r][c];
          const highlight = highlights?.[cellKey];
          const conflicted = conflicts?.has(cellKey);
          const outline = conflicted ? HIGHLIGHT_OUTLINE.conflict : highlight ? HIGHLIGHT_OUTLINE[highlight] : undefined;

          return (
            <button
              key={cellKey}
              type="button"
              disabled={!interactive}
              onClick={() => onCellClick?.(r, c)}
              className="flex items-center justify-center border-[0.5px] border-black/15 transition-colors duration-150"
              style={{
                width: cellPx,
                height: cellPx,
                background: REGION_COLORS[region % REGION_COLORS.length],
                outline,
                outlineOffset: outline ? -2 : undefined,
                cursor: interactive ? "pointer" : "default",
                fontSize: Math.max(14, Math.floor(cellPx * 0.5)),
              }}
              aria-label={`Row ${r + 1}, column ${c + 1}${mark !== "empty" ? `, ${mark}` : ""}`}
            >
              {mark === "queen" ? (
                <span style={{ color: conflicted ? "#B33A3A" : "#1c1c1c" }}>♛</span>
              ) : mark === "x" ? (
                <span className="text-black/35">✕</span>
              ) : null}
            </button>
          );
        })
      )}
    </div>
  );
}
