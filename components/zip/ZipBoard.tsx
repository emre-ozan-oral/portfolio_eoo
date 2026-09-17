"use client";

import { useCallback } from "react";
import { useCellDrag } from "@/hooks/useCellDrag";
import { Cell, key, wallBetween } from "./zipEngine";

export type CellHighlight = "hint";

type ZipBoardProps = {
  size: number;
  numbers: Map<string, number>;
  walls: Set<string>;
  path: Cell[];
  cellPx: number;
  interactive?: boolean;
  onCellClick?: (r: number, c: number) => void;
  highlightCell?: [number, number] | null;
  dimmed?: boolean;
};

const ARROWS: Record<string, string> = {
  "-1,0": "↑",
  "1,0": "↓",
  "0,-1": "←",
  "0,1": "→",
};

export default function ZipBoard({
  size,
  numbers,
  walls,
  path,
  cellPx,
  interactive = false,
  onCellClick,
  highlightCell,
  dimmed = false,
}: ZipBoardProps) {
  const pathIndex = new Map<string, number>();
  path.forEach(([r, c], i) => pathIndex.set(key(r, c), i));

  const WALL_BORDER = "3px solid var(--text)";
  const THIN_BORDER = "0.5px solid var(--border)";

  const rows = Array.from({ length: size }, (_, r) => r);
  const cols = Array.from({ length: size }, (_, c) => c);

  // Both a tap and a hold-and-drag just try to extend/retreat the path
  // through whatever cell the pointer is over, so both hook callbacks do
  // the same thing here.
  const attempt = useCallback(
    (r: number, c: number) => {
      if (interactive) onCellClick?.(r, c);
    },
    [interactive, onCellClick]
  );
  // Only `onCellEnter` drives movement during an actual drag (it already
  // includes the start cell once dragging begins); a plain tap has no
  // drag at all, so it's handled once on release instead — this avoids
  // processing the starting cell twice.
  const drag = useCellDrag({
    onCellDown: () => {},
    onCellEnter: attempt,
    onCellUp: (r, c, dragged) => {
      if (!dragged) attempt(r, c);
    },
  });

  return (
    <div
      {...drag}
      className={`inline-grid border-2 border-[var(--accent)]/40 bg-[var(--surface)] select-none ${dimmed ? "opacity-90" : ""}`}
      style={{ gridTemplateColumns: `repeat(${size}, ${cellPx}px)`, touchAction: interactive ? "none" : undefined }}
    >
      {rows.map((r) =>
        cols.map((c) => {
          const k = key(r, c);
          const idx = pathIndex.get(k);
          const onPath = idx !== undefined;
          const number = numbers.get(k);
          const isHinted = highlightCell && highlightCell[0] === r && highlightCell[1] === c;

          let arrow = "";
          if (onPath && idx! < path.length - 1) {
            const [nr, nc] = path[idx! + 1];
            arrow = ARROWS[`${nr - r},${nc - c}`] ?? "";
          }

          const fraction = onPath ? idx! / Math.max(1, size * size - 1) : 0;
          const background = onPath
            ? `color-mix(in srgb, var(--accent) ${Math.round(25 + fraction * 45)}%, transparent)`
            : undefined;

          return (
            <button
              key={k}
              type="button"
              data-r={r}
              data-c={c}
              disabled={!interactive}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (interactive) onCellClick?.(r, c);
                }
              }}
              className={`relative flex items-center justify-center transition-colors transition-transform duration-150 active:scale-95 ${
                onPath && idx === path.length - 1 ? "anim-pop" : ""
              }`}
              style={{
                width: cellPx,
                height: cellPx,
                background,
                outline: isHinted ? "2px solid var(--tag-personal)" : undefined,
                outlineOffset: isHinted ? -2 : undefined,
                borderTop: r === 0 ? THIN_BORDER : wallBetween([r, c], [r - 1, c], walls) ? WALL_BORDER : THIN_BORDER,
                borderLeft: c === 0 ? THIN_BORDER : wallBetween([r, c], [r, c - 1], walls) ? WALL_BORDER : THIN_BORDER,
                borderRight: c === size - 1 ? THIN_BORDER : undefined,
                borderBottom: r === size - 1 ? THIN_BORDER : undefined,
                cursor: interactive ? "pointer" : "default",
                fontFamily: "var(--font-mono)",
              }}
              aria-label={`Row ${r + 1}, column ${c + 1}${number ? `, clue ${number}` : ""}`}
            >
              {number !== undefined && (
                <span
                  className="text-[var(--text)] font-semibold"
                  style={{ fontSize: Math.max(12, Math.floor(cellPx * 0.36)) }}
                >
                  {number}
                </span>
              )}
              {arrow && (
                <span
                  className="absolute text-[var(--accent)]"
                  style={{ fontSize: Math.max(10, Math.floor(cellPx * 0.3)), opacity: 0.8 }}
                >
                  {number === undefined ? arrow : ""}
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
