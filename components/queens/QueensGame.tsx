"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiZap, FiRefreshCw } from "react-icons/fi";
import {
  Difficulty,
  Marks,
  Puzzle,
  cycleMark,
  emptyMarks,
  findConflicts,
  checkWin,
  generatePuzzle,
} from "./queensEngine";
import { nextHint } from "./solver";
import QueensBoard, { CellHighlight } from "./QueensBoard";

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];

const CELL_PX: Record<Difficulty, number> = {
  small: 56,
  medium: 48,
  large: 40,
};

const HINT_COOLDOWN_MS = 20_000;

export default function QueensGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("small");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [marks, setMarks] = useState<Marks>([]);
  const [won, setWon] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintHighlights, setHintHighlights] = useState<Record<string, CellHighlight>>({});
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);

  const newGame = useCallback((nextDifficulty: Difficulty) => {
    const p = generatePuzzle(nextDifficulty);
    setDifficulty(nextDifficulty);
    setPuzzle(p);
    setMarks(emptyMarks(p.n));
    setWon(false);
    setHintMessage(null);
    setHintHighlights({});
    setCooldownUntil(0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newGame("small");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ticks once a second, purely so the cooldown countdown re-renders.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const conflicts = useMemo(() => (puzzle ? findConflicts(marks, puzzle.regions) : new Set<string>()), [
    puzzle,
    marks,
  ]);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (!puzzle || won) return;
      setHintMessage(null);
      setHintHighlights({});
      setMarks((m) => {
        const next = cycleMark(m, r, c);
        if (checkWin(next, puzzle.regions)) setWon(true);
        return next;
      });
    },
    [puzzle, won]
  );

  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const onCooldown = cooldownRemaining > 0;

  const handleHint = useCallback(() => {
    if (!puzzle || won || onCooldown) return;
    const step = nextHint(puzzle, marks);
    if (!step) return;

    setMarks(step.marks);
    setHintMessage(step.message);
    const highlight: Record<string, CellHighlight> = {};
    for (const [r, c] of step.sourceCells) highlight[`${r},${c}`] = "source";
    for (const [r, c] of step.targetCells) highlight[`${r},${c}`] = "target";
    setHintHighlights(highlight);
    setCooldownUntil(Date.now() + HINT_COOLDOWN_MS);
    setNow(Date.now());
    if (checkWin(step.marks, puzzle.regions)) setWon(true);
  }, [puzzle, marks, won, onCooldown]);

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <FiRefreshCw className="animate-spin text-[var(--accent)]" size={22} />
        <p className="text-[var(--dim)] text-[11px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Growing regions…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-1 border border-[var(--border)] p-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => newGame(d.key)}
            className={`px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
              difficulty === d.key ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-full overflow-x-auto">
        <QueensBoard
          n={puzzle.n}
          regions={puzzle.regions}
          marks={marks}
          cellPx={CELL_PX[difficulty]}
          interactive={!won}
          onCellClick={handleCellClick}
          highlights={hintHighlights}
          conflicts={conflicts}
          dimmed={won}
        />

        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/90 backdrop-blur-sm">
            <p
              className="text-2xl"
              style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 600, color: "var(--accent)" }}
            >
              Solved
            </p>
            <button
              type="button"
              onClick={() => newGame(difficulty)}
              className="mt-4 px-5 py-2 text-[11px] tracking-[0.18em] uppercase text-[var(--bg)] bg-[var(--accent)] hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              New puzzle
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleHint}
          disabled={won || onCooldown}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiZap size={13} /> {onCooldown ? `Hint (${cooldownRemaining}s)` : "Hint"}
        </button>
        <button
          type="button"
          onClick={() => newGame(difficulty)}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--bg)] bg-[var(--accent)] hover:opacity-90 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          New puzzle
        </button>
      </div>

      <div className="h-[60px] max-w-md flex items-center justify-center text-center">
        {hintMessage && (
          <p className="text-[var(--dim)] text-[11px] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-[var(--accent)]">Clue —</span> {hintMessage}
          </p>
        )}
      </div>

      <p className="text-[var(--dim)] text-[10px] tracking-[0.1em] text-center max-w-sm" style={{ fontFamily: "var(--font-mono)" }}>
        Tap once for ✕, again for ♛, again to clear. One queen per row, column, and color — no two queens
        touching, even diagonally. Hints have a cooldown so they stay a nudge, not a solve button.
      </p>
    </div>
  );
}
