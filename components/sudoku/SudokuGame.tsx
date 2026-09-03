"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRotateCcw, FiDelete, FiRefreshCw, FiEye } from "react-icons/fi";
import {
  Board,
  Difficulty,
  CLUE_TARGET,
  cloneBoard,
  emptyBoard,
  generatePuzzle,
  hasConflict,
  isBoardComplete,
  boardsEqual,
  formatTime,
  SIZE,
} from "./sudokuEngine";

type Pos = { r: number; c: number };
type Move = { r: number; c: number; prev: number };
type Status = "loading" | "playing" | "solved" | "revealed";

type GameState = {
  status: Status;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board: Board;
  elapsed: number;
  mistakes: number;
};

type SavedState = {
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board: Board;
  elapsed: number;
  mistakes: number;
  solved: boolean;
};

const STORAGE_KEY = "sudoku-state-v1";

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "easy", label: "Easy" },
  { key: "normal", label: "Normal" },
  { key: "hard", label: "Hard" },
];

const INITIAL_STATE: GameState = {
  status: "loading",
  difficulty: "normal",
  puzzle: emptyBoard(),
  solution: emptyBoard(),
  board: emptyBoard(),
  elapsed: 0,
  mistakes: 0,
};

function loadSaved(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed?.board || !parsed?.puzzle || !parsed?.solution) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function SudokuGame() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [history, setHistory] = useState<Move[]>([]);

  const { status, difficulty, puzzle, solution, board, elapsed, mistakes } = game;
  const loading = status === "loading";
  const solved = status === "solved";
  const revealed = status === "revealed";
  const running = status === "playing";

  const newGame = useCallback((nextDifficulty: Difficulty) => {
    setGame((g) => ({ ...g, status: "loading" }));
    setSelected(null);
    setHistory([]);
    // Defer to let the "Generating…" status paint before the (synchronous,
    // CPU-bound) generator runs.
    window.setTimeout(() => {
      const { puzzle: p, solution: s } = generatePuzzle(nextDifficulty);
      setGame({
        status: "playing",
        difficulty: nextDifficulty,
        puzzle: p,
        solution: s,
        board: cloneBoard(p),
        elapsed: 0,
        mistakes: 0,
      });
    }, 20);
  }, []);

  // Hydrate from localStorage (or start a fresh game) once, on mount.
  // localStorage is only reachable client-side, so this one-time sync from
  // an external system has to happen in an effect.
  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGame({
        status: saved.solved ? "solved" : "playing",
        difficulty: saved.difficulty,
        puzzle: saved.puzzle,
        solution: saved.solution,
        board: saved.board,
        elapsed: saved.elapsed,
        mistakes: saved.mistakes,
      });
    } else {
      newGame("normal");
    }
  }, [newGame]);

  // Timer — ticks once a second while a game is in progress.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setGame((g) => (g.status === "playing" ? { ...g, elapsed: g.elapsed + 1 } : g));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Persist to localStorage whenever the game state changes.
  useEffect(() => {
    if (loading) return;
    const state: SavedState = {
      difficulty,
      puzzle,
      solution,
      board,
      elapsed,
      mistakes,
      solved: status === "solved",
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [loading, difficulty, puzzle, solution, board, elapsed, mistakes, status]);

  const isGiven = useCallback((r: number, c: number) => puzzle[r][c] !== 0, [puzzle]);

  const setCell = useCallback(
    (r: number, c: number, value: number) => {
      if (status !== "playing") return;
      if (isGiven(r, c)) return;
      const prev = board[r][c];
      if (prev === value) return;

      const nextBoard = cloneBoard(board);
      nextBoard[r][c] = value;

      const isMistake = value !== 0 && value !== solution[r][c];
      const justWon = isBoardComplete(nextBoard) && boardsEqual(nextBoard, solution);

      setHistory((h) => [...h, { r, c, prev }]);
      setGame((g) => ({
        ...g,
        board: nextBoard,
        mistakes: isMistake ? g.mistakes + 1 : g.mistakes,
        status: justWon ? "solved" : g.status,
      }));
    },
    [status, isGiven, board, solution]
  );

  const handleUndo = useCallback(() => {
    if (status !== "playing" || history.length === 0) return;
    const last = history[history.length - 1];
    setGame((g) => {
      const nextBoard = cloneBoard(g.board);
      nextBoard[last.r][last.c] = last.prev;
      return { ...g, board: nextBoard };
    });
    setHistory((h) => h.slice(0, -1));
  }, [status, history]);

  const handleReset = useCallback(() => {
    setHistory([]);
    setGame((g) => ({ ...g, status: "playing", board: cloneBoard(g.puzzle), mistakes: 0, elapsed: 0 }));
  }, []);

  const handleReveal = useCallback(() => {
    setSelected(null);
    setGame((g) => ({ ...g, status: "revealed", board: cloneBoard(g.solution) }));
  }, []);

  // Keyboard input.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selected) return;
      const { r, c } = selected;
      if (e.key >= "1" && e.key <= "9") {
        setCell(r, c, Number(e.key));
        e.preventDefault();
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        setCell(r, c, 0);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setSelected({ r: Math.max(0, r - 1), c });
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        setSelected({ r: Math.min(SIZE - 1, r + 1), c });
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        setSelected({ r, c: Math.max(0, c - 1) });
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        setSelected({ r, c: Math.min(SIZE - 1, c + 1) });
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, setCell]);

  const remainingCounts = useMemo(() => {
    const counts = new Array(10).fill(9);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = board[r][c];
        if (v) counts[v]--;
      }
    }
    return counts;
  }, [board]);

  const selectedValue = selected ? board[selected.r][selected.c] : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <FiRefreshCw className="animate-spin text-[#D4A847]" size={22} />
        <p
          className="text-[#6A6670] text-[11px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Generating puzzle…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Difficulty tabs */}
      <div className="flex items-center gap-1 border border-[#1D1D21] p-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => newGame(d.key)}
            className={`px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2 ${
              difficulty === d.key
                ? "bg-[#D4A847] text-[#0C0C0D]"
                : "text-[#8C8894] hover:text-[#EDE9E0]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Status row */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <span
            className="text-[#EDE9E0] text-lg tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatTime(elapsed)}
          </span>
          <span
            className="text-[#6A6670] text-[9px] tracking-[0.2em] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Time
          </span>
        </div>
        <div className="w-px h-8 bg-[#1D1D21]" />
        <div className="flex flex-col items-center">
          <span
            className={`text-lg tabular-nums ${mistakes > 0 ? "text-[#D46A6A]" : "text-[#EDE9E0]"}`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {mistakes}
          </span>
          <span
            className="text-[#6A6670] text-[9px] tracking-[0.2em] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Mistakes
          </span>
        </div>
        <div className="w-px h-8 bg-[#1D1D21]" />
        <div className="flex flex-col items-center">
          <span
            className="text-[#EDE9E0] text-lg tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {81 - CLUE_TARGET[difficulty]}
          </span>
          <span
            className="text-[#6A6670] text-[9px] tracking-[0.2em] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            To fill
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <div
          className={`grid grid-cols-9 border-2 border-[#D4A847]/40 bg-[#131315] select-none ${
            solved || revealed ? "opacity-90" : ""
          }`}
        >
          {board.map((row, r) =>
            row.map((value, c) => {
              const given = isGiven(r, c);
              const isSelected = selected?.r === r && selected?.c === c;
              const sameRowCol = selected && (selected.r === r || selected.c === c);
              const sameBox =
                selected &&
                Math.floor(selected.r / 3) === Math.floor(r / 3) &&
                Math.floor(selected.c / 3) === Math.floor(c / 3);
              const sameValue = selectedValue !== 0 && value === selectedValue;
              const conflict = value !== 0 && hasConflict(board, r, c);

              let bg = "bg-transparent";
              if (isSelected) bg = "bg-[#D4A847]/25";
              else if (sameValue) bg = "bg-[#D4A847]/12";
              else if (sameBox || sameRowCol) bg = "bg-white/[0.03]";

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => status === "playing" && setSelected({ r, c })}
                  className={`
                    aspect-square w-[min(9.5vw,42px)] sm:w-[46px] flex items-center justify-center
                    text-[17px] sm:text-[19px] transition-colors duration-150
                    border-[0.5px] border-[#1D1D21]
                    ${r % 3 === 0 ? "border-t-[1.5px] border-t-[#D4A847]/40" : ""}
                    ${c % 3 === 0 ? "border-l-[1.5px] border-l-[#D4A847]/40" : ""}
                    ${r === 8 ? "border-b-[1.5px] border-b-[#D4A847]/40" : ""}
                    ${c === 8 ? "border-r-[1.5px] border-r-[#D4A847]/40" : ""}
                    ${bg}
                  `}
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: conflict ? "#D46A6A" : given ? "#EDE9E0" : "#D4A847",
                    fontWeight: given ? 500 : 600,
                    cursor: status === "playing" ? "pointer" : "default",
                  }}
                  aria-label={`Row ${r + 1}, column ${c + 1}${value ? `, ${value}` : ", empty"}`}
                >
                  {value !== 0 ? value : ""}
                </button>
              );
            })
          )}
        </div>

        {solved && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0C0C0D]/90 backdrop-blur-sm">
            <p
              className="text-[#D4A847] text-2xl"
              style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 600 }}
            >
              Solved
            </p>
            <p
              className="text-[#8C8894] text-[12px] tracking-[0.1em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatTime(elapsed)} · {mistakes} mistake{mistakes === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={() => newGame(difficulty)}
              className="mt-4 px-5 py-2 text-[11px] tracking-[0.18em] uppercase text-[#0C0C0D] bg-[#D4A847] hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Play again
            </button>
          </div>
        )}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-9 gap-1.5 w-full max-w-[420px]">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            type="button"
            disabled={!selected || status !== "playing" || remainingCounts[d] <= 0}
            onClick={() => selected && setCell(selected.r, selected.c, d)}
            className="aspect-square flex flex-col items-center justify-center border border-[#1D1D21] text-[#EDE9E0] text-[15px] hover:border-[#D4A847]/40 hover:text-[#D4A847] transition-colors duration-150 disabled:opacity-25 disabled:hover:border-[#1D1D21] disabled:hover:text-[#EDE9E0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleUndo}
          disabled={history.length === 0 || status !== "playing"}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[#8C8894] border border-[#1D1D21] hover:text-[#EDE9E0] hover:border-[#8C8894]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiRotateCcw size={13} /> Undo
        </button>
        <button
          type="button"
          onClick={() => selected && setCell(selected.r, selected.c, 0)}
          disabled={!selected || status !== "playing"}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[#8C8894] border border-[#1D1D21] hover:text-[#EDE9E0] hover:border-[#8C8894]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiDelete size={13} /> Erase
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[#8C8894] border border-[#1D1D21] hover:text-[#EDE9E0] hover:border-[#8C8894]/40 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiRefreshCw size={13} /> Restart
        </button>
        <button
          type="button"
          onClick={handleReveal}
          disabled={status !== "playing"}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[#8C8894] border border-[#1D1D21] hover:text-[#D46A6A] hover:border-[#D46A6A]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiEye size={13} /> Reveal
        </button>
        <button
          type="button"
          onClick={() => newGame(difficulty)}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[#0C0C0D] bg-[#D4A847] hover:opacity-90 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A847] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          New game
        </button>
      </div>
    </div>
  );
}
