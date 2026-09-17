"use client";

import { useCallback, useEffect, useState } from "react";
import { FiZap, FiRefreshCw, FiCornerUpLeft, FiRotateCcw } from "react-icons/fi";
import {
  Cell,
  Difficulty,
  Puzzle,
  generatePuzzle,
  isValidMove,
  isWinningPath,
  highestNumberOnPath,
} from "./zipEngine";
import { nextHint } from "./solver";
import ZipBoard from "./ZipBoard";

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];

const CELL_PX: Record<Difficulty, number> = {
  small: 58,
  medium: 50,
  large: 44,
};

const HINT_COOLDOWN_MS = 20_000;

export default function ZipGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("small");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [path, setPath] = useState<Cell[]>([]);
  const [won, setWon] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintCell, setHintCell] = useState<[number, number] | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);

  const newGame = useCallback((nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty);
    setPuzzle(generatePuzzle(nextDifficulty));
    setPath([]);
    setWon(false);
    setHintMessage(null);
    setHintCell(null);
    setCooldownUntil(0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newGame("small");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const locked = puzzle ? path.length > 0 && highestNumberOnPath(puzzle, path) === puzzle.maxNumber : false;
  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const onCooldown = cooldownRemaining > 0;

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (!puzzle || won || locked) return;
      if (!isValidMove(puzzle, path, [r, c])) return;
      const nextPath: Cell[] = [...path, [r, c]];
      setPath(nextPath);
      setHintMessage(null);
      setHintCell(null);
      if (isWinningPath(puzzle, nextPath)) setWon(true);
    },
    [puzzle, path, won, locked]
  );

  const handleUndo = useCallback(() => {
    if (won) return;
    setPath((p) => p.slice(0, -1));
    setHintMessage(null);
    setHintCell(null);
  }, [won]);

  const handleHint = useCallback(() => {
    if (!puzzle || won || onCooldown) return;
    const step = nextHint(puzzle, path);
    if (!step) return;
    setPath(step.path);
    setHintMessage(step.message);
    setHintCell(step.path[step.path.length - 1]);
    setCooldownUntil(Date.now() + HINT_COOLDOWN_MS);
    setNow(Date.now());
    if (isWinningPath(puzzle, step.path)) setWon(true);
  }, [puzzle, path, won, onCooldown]);

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <FiRefreshCw className="animate-spin text-[var(--accent)]" size={22} />
        <p className="text-[var(--dim)] text-[11px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Tracing a route…
        </p>
      </div>
    );
  }

  const total = puzzle.size * puzzle.size;

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

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-[var(--text)] text-lg tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
            {path.length} / {total}
          </span>
          <span className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
            Cells filled
          </span>
        </div>
        <div className="w-px h-8 bg-[var(--border)]" />
        <div className="flex flex-col items-center">
          <span className="text-[var(--text)] text-lg tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
            {highestNumberOnPath(puzzle, path)} / {puzzle.maxNumber}
          </span>
          <span className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
            Numbers hit
          </span>
        </div>
      </div>

      <div className="relative max-w-full overflow-x-auto">
        <ZipBoard
          size={puzzle.size}
          numbers={puzzle.numbers}
          walls={puzzle.walls}
          path={path}
          cellPx={CELL_PX[difficulty]}
          interactive={!won && !locked}
          onCellClick={handleCellClick}
          highlightCell={hintCell}
          dimmed={won}
        />

        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/90 backdrop-blur-sm">
            <p
              className="text-2xl"
              style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 600, color: "var(--accent)" }}
            >
              Zipped
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

      {locked && !won && (
        <p className="text-[var(--error)] text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
          That reached the last number early, with cells still unvisited — undo and try another route.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleUndo}
          disabled={path.length === 0 || won}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiCornerUpLeft size={13} /> Undo
        </button>
        <button
          type="button"
          onClick={() => setPath([])}
          disabled={path.length === 0 || won}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiRotateCcw size={13} /> Reset path
        </button>
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
        Start at 1 and tap adjacent cells to draw one path through every cell, hitting the numbers in
        order. Thick borders are walls the path can&apos;t cross. Hints have a cooldown so they stay a nudge.
      </p>
    </div>
  );
}
