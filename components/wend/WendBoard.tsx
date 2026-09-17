"use client";

import { PlantedWord, key, wordIdAtCell } from "./wendEngine";

type WendBoardProps = {
  rows: number;
  cols: number;
  letters: (string | null)[][];
  words: PlantedWord[];
  solvedIds: Set<number>;
  selection: [number, number][];
  hintCells: [number, number][];
  cellPx: number;
  interactive?: boolean;
  onCellClick?: (r: number, c: number) => void;
  dimmed?: boolean;
};

const SOLVED_COLORS = [
  "color-mix(in srgb, var(--tag-personal) 55%, transparent)",
  "color-mix(in srgb, var(--accent) 45%, transparent)",
  "color-mix(in srgb, #B48EAD 50%, transparent)",
  "color-mix(in srgb, #4FBDBD 45%, transparent)",
  "color-mix(in srgb, #C97B4A 45%, transparent)",
];

export default function WendBoard({
  cols,
  letters,
  words,
  solvedIds,
  selection,
  hintCells,
  cellPx,
  interactive = false,
  onCellClick,
  dimmed = false,
}: WendBoardProps) {
  const selectionIndex = new Map<string, number>();
  selection.forEach(([r, c], i) => selectionIndex.set(key(r, c), i));
  const hintSet = new Set(hintCells.map(([r, c]) => key(r, c)));

  return (
    <div
      className={`inline-grid border-2 border-[var(--accent)]/40 bg-[var(--surface)] select-none ${dimmed ? "opacity-90" : ""}`}
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellPx}px)` }}
    >
      {letters.map((row, r) =>
        row.map((letter, c) => {
          const k = key(r, c);
          const blocked = letter === null;
          const wordId = blocked ? undefined : wordIdAtCell(words, r, c);
          const solved = wordId !== undefined && solvedIds.has(wordId);
          const selIdx = selectionIndex.get(k);
          const hinted = hintSet.has(k);

          let background: string | undefined;
          if (blocked) background = "var(--dim)";
          else if (solved) background = SOLVED_COLORS[wordId! % SOLVED_COLORS.length];
          else if (selIdx !== undefined) background = "color-mix(in srgb, var(--accent) 35%, transparent)";
          else if (hinted) background = "color-mix(in srgb, var(--tag-personal) 30%, transparent)";

          return (
            <button
              key={k}
              type="button"
              disabled={!interactive || blocked}
              onClick={() => onCellClick?.(r, c)}
              className="relative flex items-center justify-center border-[0.5px] border-[var(--border)] transition-colors duration-150"
              style={{
                width: cellPx,
                height: cellPx,
                background,
                cursor: interactive && !blocked ? "pointer" : "default",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: Math.max(14, Math.floor(cellPx * 0.4)),
                color: blocked ? "transparent" : "var(--text)",
              }}
              aria-label={blocked ? "Blocked cell" : `Row ${r + 1}, column ${c + 1}, letter ${letter}`}
            >
              {!blocked && letter}
              {selIdx !== undefined && (
                <span
                  className="absolute bottom-0.5 right-1 text-[9px] text-[var(--accent)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {selIdx + 1}
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
