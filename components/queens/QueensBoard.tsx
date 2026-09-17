"use client";

import { useCallback } from "react";
import { useCellDrag } from "@/hooks/useCellDrag";
import { Marks } from "./queensEngine";

export type CellHighlight = "source" | "target" | "conflict";

type QueensBoardProps = {
  n: number;
  regions: number[][];
  marks: Marks;
  cellPx: number;
  interactive?: boolean;
  /** Fires once, immediately, for the cell a gesture starts on. */
  onCellDown?: (r: number, c: number) => void;
  /** Fires for every new cell entered while the pointer is held — this is
   * what lets holding and dragging paint X marks across several cells. */
  onCellEnter?: (r: number, c: number) => void;
  /** Fires on release; `dragged` is false for a plain tap (no movement). */
  onCellUp?: (r: number, c: number, dragged: boolean) => void;
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
  onCellDown,
  onCellEnter,
  onCellUp,
  highlights,
  conflicts,
  dimmed = false,
}: QueensBoardProps) {
  const guardedDown = useCallback((r: number, c: number) => interactive && onCellDown?.(r, c), [interactive, onCellDown]);
  const guardedEnter = useCallback((r: number, c: number) => interactive && onCellEnter?.(r, c), [interactive, onCellEnter]);
  const guardedUp = useCallback(
    (r: number, c: number, dragged: boolean) => interactive && onCellUp?.(r, c, dragged),
    [interactive, onCellUp]
  );
  const drag = useCellDrag({ onCellDown: guardedDown, onCellEnter: guardedEnter, onCellUp: guardedUp });

  return (
    <div
      {...drag}
      className={`inline-grid border-2 border-[var(--accent)]/40 select-none ${dimmed ? "opacity-90" : ""}`}
      style={{ gridTemplateColumns: `repeat(${n}, ${cellPx}px)`, touchAction: interactive ? "none" : undefined }}
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
              data-r={r}
              data-c={c}
              disabled={!interactive}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (interactive) onCellUp?.(r, c, false);
                }
              }}
              className={`flex items-center justify-center border-[0.5px] border-black/15 transition-colors transition-transform duration-150 active:scale-95 ${
                highlight === "target" ? "anim-pulse" : ""
              }`}
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
                <span className="anim-pop" style={{ display: "inline-block", color: conflicted ? "#B33A3A" : "#1c1c1c" }}>
                  ♛
                </span>
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
