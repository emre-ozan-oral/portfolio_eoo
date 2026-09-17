"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiZap, FiRefreshCw, FiRotateCcw } from "react-icons/fi";
import { SOLVER_ENABLED } from "../gameConfig";
import {
  Cell,
  Difficulty,
  Puzzle,
  generatePuzzle,
  wordIdAtCell,
  areOrthogonallyAdjacent,
  selectionMatchesWord,
} from "./wendEngine";
import { nextHint, allWordsSolved } from "./solver";
import WendBoard from "./WendBoard";
import WendWordCounts from "./WendWordCounts";

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];

const CELL_PX: Record<Difficulty, number> = {
  small: 62,
  medium: 54,
  large: 48,
};

const HINT_COOLDOWN_MS = 20_000;

export default function WendGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("small");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selection, setSelection] = useState<Cell[]>([]);
  // Mirrors `selection`/`solvedIds` synchronously. A hold-and-drag can fire
  // several cell events within a single native pointer event (the drag's
  // start cell, then wherever it moved to); handleCellClick needs the
  // *result* of the first of those to validate the second, but the state
  // variables themselves won't reflect that update until React re-renders
  // -- reading and writing these refs instead keeps every call within the
  // same gesture consistent, even back-to-back before a render happens.
  const selectionRef = useRef<Cell[]>([]);
  const applySelection = useCallback((next: Cell[]) => {
    selectionRef.current = next;
    setSelection(next);
  }, []);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const solvedIdsRef = useRef<Set<number>>(new Set());
  const applySolvedIds = useCallback((next: Set<number>) => {
    solvedIdsRef.current = next;
    setSolvedIds(next);
  }, []);
  const [revealed, setRevealed] = useState<Record<number, number>>({});
  const [won, setWon] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);

  const newGame = useCallback(
    (nextDifficulty: Difficulty) => {
      setDifficulty(nextDifficulty);
      setPuzzle(generatePuzzle(nextDifficulty));
      applySelection([]);
      applySolvedIds(new Set());
      setRevealed({});
      setWon(false);
      setHintMessage(null);
      setCooldownUntil(0);
    },
    [applySelection, applySolvedIds]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newGame("small");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const onCooldown = cooldownRemaining > 0;

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (!puzzle || won) return;
      if (puzzle.letters[r][c] === null) return;
      const currentSolved = solvedIdsRef.current;
      const wid = wordIdAtCell(puzzle.words, r, c);
      if (wid !== undefined && currentSolved.has(wid)) return;

      const currentSelection = selectionRef.current;
      let nextSelection: Cell[];
      if (currentSelection.length === 0) {
        nextSelection = [[r, c]];
      } else {
        const last = currentSelection[currentSelection.length - 1];
        if (last[0] === r && last[1] === c) {
          nextSelection = currentSelection.slice(0, -1);
        } else {
          const idx = currentSelection.findIndex(([sr, sc]) => sr === r && sc === c);
          if (idx !== -1) {
            nextSelection = currentSelection.slice(0, idx + 1);
          } else if (areOrthogonallyAdjacent(last, [r, c])) {
            nextSelection = [...currentSelection, [r, c]];
          } else {
            nextSelection = [[r, c]];
          }
        }
      }

      setHintMessage(null);
      const matched = puzzle.words.find((w) => !currentSolved.has(w.id) && selectionMatchesWord(nextSelection, w));
      if (matched) {
        const nextSolved = new Set(currentSolved);
        nextSolved.add(matched.id);
        applySolvedIds(nextSolved);
        applySelection([]);
        if (allWordsSolved(puzzle, nextSolved)) setWon(true);
      } else {
        applySelection(nextSelection);
      }
    },
    [puzzle, won, applySelection, applySolvedIds]
  );

  const handleHint = useCallback(() => {
    if (!puzzle || won || onCooldown) return;
    const step = nextHint(puzzle, solvedIdsRef.current, revealed);
    if (!step) return;

    setRevealed((prev) => ({ ...prev, [step.wordId]: (prev[step.wordId] ?? 0) + 1 }));
    setHintMessage(step.message);
    setCooldownUntil(Date.now() + HINT_COOLDOWN_MS);
    setNow(Date.now());

    if (step.completesWord) {
      const nextSolved = new Set(solvedIdsRef.current);
      nextSolved.add(step.wordId);
      applySolvedIds(nextSolved);
      applySelection(selectionRef.current.filter(([r, c]) => wordIdAtCell(puzzle.words, r, c) !== step.wordId));
      if (allWordsSolved(puzzle, nextSolved)) setWon(true);
    }
  }, [puzzle, won, onCooldown, revealed, applySolvedIds, applySelection]);

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <FiRefreshCw className="animate-spin text-[var(--accent)]" size={22} />
        <p className="text-[var(--dim)] text-[11px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Weaving words…
        </p>
      </div>
    );
  }

  const hintCells: Cell[] = puzzle.words
    .filter((w) => !solvedIds.has(w.id))
    .flatMap((w) => w.path.slice(0, revealed[w.id] ?? 0));

  const solvedCount = solvedIds.size;

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
            {solvedCount} / {puzzle.words.length}
          </span>
          <span className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
            Words found
          </span>
        </div>
      </div>

      <WendWordCounts words={puzzle.words} solvedIds={solvedIds} />

      <div className="relative max-w-full overflow-x-auto">
        <WendBoard
          rows={puzzle.rows}
          cols={puzzle.cols}
          letters={puzzle.letters}
          words={puzzle.words}
          solvedIds={solvedIds}
          selection={selection}
          hintCells={hintCells}
          cellPx={CELL_PX[difficulty]}
          interactive={!won}
          onCellClick={handleCellClick}
          dimmed={won}
        />

        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/90 backdrop-blur-sm anim-fade-in">
            <p
              className="text-2xl"
              style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 600, color: "var(--accent)" }}
            >
              Wended
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
          onClick={() => applySelection([])}
          disabled={selection.length === 0 || won}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiRotateCcw size={13} /> Clear selection
        </button>
        {SOLVER_ENABLED && (
        <button
          type="button"
          onClick={handleHint}
          disabled={won || onCooldown}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiZap size={13} /> {onCooldown ? `Hint (${cooldownRemaining}s)` : "Hint"}
        </button>
        )}
        <button
          type="button"
          onClick={() => newGame(difficulty)}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--bg)] bg-[var(--accent)] hover:opacity-90 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          New puzzle
        </button>
      </div>

      {SOLVER_ENABLED && (
      <div className="h-[60px] max-w-md flex items-center justify-center text-center">
        {hintMessage && (
          <p className="text-[var(--dim)] text-[11px] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-[var(--accent)]">Clue —</span> {hintMessage}
          </p>
        )}
      </div>
      )}

      <p className="text-[var(--dim)] text-[10px] tracking-[0.1em] text-center max-w-sm" style={{ fontFamily: "var(--font-mono)" }}>
        Hold and drag (or tap letter by letter) through adjacent letters to trace a word — every letter
        on the board is used by exactly one word. Dark cells are unused.
      </p>
    </div>
  );
}
