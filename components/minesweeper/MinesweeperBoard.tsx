"use client";

import { Board } from "./minesweeperEngine";

export type CellHighlight = "source" | "safe" | "mine" | "guess";

type MinesweeperBoardProps = {
  board: Board;
  cellPx: number;
  interactive?: boolean;
  onCellClick?: (r: number, c: number) => void;
  onCellContextMenu?: (e: React.MouseEvent, r: number, c: number) => void;
  highlights?: Record<string, CellHighlight>;
  probabilities?: Record<string, number>;
  dimmed?: boolean;
};

// Classic Minesweeper adjacency-count colors, reusing the site's palette
// where it already has a matching hue.
const NUMBER_COLORS: Record<number, string> = {
  1: "var(--tag-work)",
  2: "var(--tag-personal)",
  3: "var(--error)",
  4: "#B48EAD",
  5: "#C97B4A",
  6: "#4FBDBD",
  7: "var(--text)",
  8: "var(--muted)",
};

const HIGHLIGHT_STYLES: Record<CellHighlight, { background: string; outline: string }> = {
  source: {
    background: "color-mix(in srgb, var(--accent) 30%, transparent)",
    outline: "1.5px solid var(--accent)",
  },
  safe: {
    background: "color-mix(in srgb, var(--tag-personal) 35%, transparent)",
    outline: "1.5px solid var(--tag-personal)",
  },
  mine: {
    background: "color-mix(in srgb, var(--error) 35%, transparent)",
    outline: "1.5px solid var(--error)",
  },
  guess: {
    background: "color-mix(in srgb, #B48EAD 35%, transparent)",
    outline: "1.5px solid #B48EAD",
  },
};

export default function MinesweeperBoard({
  board,
  cellPx,
  interactive = false,
  onCellClick,
  onCellContextMenu,
  highlights,
  probabilities,
  dimmed = false,
}: MinesweeperBoardProps) {
  const cols = board[0]?.length ?? 0;

  return (
    <div
      className={`inline-grid border-2 border-[var(--accent)]/40 bg-[var(--surface)] select-none ${
        dimmed ? "opacity-90" : ""
      }`}
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellPx}px)` }}
    >
      {board.map((row, r) =>
        row.map((cell, c) => {
          const cellKey = `${r},${c}`;
          const showMine = cell.revealed && cell.mine;
          const highlight = highlights?.[cellKey];
          const highlightStyle = highlight ? HIGHLIGHT_STYLES[highlight] : null;
          const prob = !cell.revealed && !cell.flagged ? probabilities?.[cellKey] : undefined;

          let background: string | undefined;
          if (highlightStyle) background = highlightStyle.background;
          else if (showMine) background = "color-mix(in srgb, var(--error) 20%, transparent)";
          else if (prob !== undefined)
            background = `color-mix(in srgb, var(--error) ${Math.round(prob * 70)}%, transparent)`;

          return (
            <button
              key={cellKey}
              type="button"
              disabled={!interactive}
              onClick={() => onCellClick?.(r, c)}
              onContextMenu={(e) => {
                if (!interactive) return;
                onCellContextMenu?.(e, r, c);
              }}
              className={`flex items-center justify-center border-[0.5px] border-[var(--border)] transition-colors duration-150 ${
                cell.revealed
                  ? `${!cell.mine ? "anim-cell-reveal" : ""} ${
                      interactive && !cell.mine && cell.adjacent > 0 ? "hover:bg-white/[0.05]" : ""
                    }`
                  : interactive
                    ? "bg-white/[0.03] hover:bg-white/[0.06]"
                    : "bg-white/[0.03]"
              }`}
              style={{
                width: cellPx,
                height: cellPx,
                fontFamily: "var(--font-mono)",
                fontSize: Math.max(10, Math.floor(cellPx * 0.42)),
                fontWeight: 600,
                color: cell.revealed && !cell.mine ? NUMBER_COLORS[cell.adjacent] : "var(--dim)",
                cursor: interactive ? "pointer" : "default",
                background,
                outline: highlightStyle?.outline,
                outlineOffset: highlightStyle ? -1 : undefined,
              }}
              aria-label={`Row ${r + 1}, column ${c + 1}${
                cell.flagged ? ", flagged" : cell.revealed ? (cell.mine ? ", mine" : `, ${cell.adjacent}`) : ""
              }`}
            >
              {cell.revealed
                ? cell.mine
                  ? "✹"
                  : cell.adjacent > 0
                    ? cell.adjacent
                    : ""
                : cell.flagged
                  ? "⚑"
                  : prob !== undefined
                    ? Math.round(prob * 100)
                    : ""}
            </button>
          );
        })
      )}
    </div>
  );
}
