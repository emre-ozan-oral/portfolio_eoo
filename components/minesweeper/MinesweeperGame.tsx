"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiFlag, FiEye, FiRefreshCw } from "react-icons/fi";
import {
  Board,
  Difficulty,
  DIFFICULTY_CONFIG,
  buildBoard,
  emptyBoard,
  revealCell,
  revealAllMines,
  chordTargets,
  chordReveal,
  toggleFlag,
  countFlags,
  checkWin,
  formatTime,
} from "./minesweeperEngine";
import MinesweeperBoard from "./MinesweeperBoard";

type Status = "loading" | "playing" | "won" | "lost" | "revealed";

type GameState = {
  status: Status;
  difficulty: Difficulty;
  board: Board;
  firstClickDone: boolean;
  elapsed: number;
};

type SavedState = {
  difficulty: Difficulty;
  board: Board;
  firstClickDone: boolean;
  elapsed: number;
  status: Status;
};

const STORAGE_KEY = "minesweeper-state-v1";

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "expert", label: "Expert" },
];

// Cell pixel size per difficulty — larger boards need smaller cells to stay
// on-screen; the board wrapper also scrolls horizontally as a fallback.
const CELL_PX: Record<Difficulty, number> = {
  beginner: 38,
  intermediate: 30,
  expert: 22,
};

const INITIAL_STATE: GameState = {
  status: "loading",
  difficulty: "beginner",
  board: emptyBoard(9, 9),
  firstClickDone: false,
  elapsed: 0,
};

function loadSaved(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed?.board || !parsed?.difficulty) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function MinesweeperGame() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [flagMode, setFlagMode] = useState(false);

  const { status, difficulty, board, firstClickDone, elapsed } = game;
  const loading = status === "loading";
  const running = status === "playing";
  const ended = status === "won" || status === "lost" || status === "revealed";
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];

  const newGame = useCallback((nextDifficulty: Difficulty) => {
    const { rows: r, cols: c } = DIFFICULTY_CONFIG[nextDifficulty];
    setFlagMode(false);
    setGame({
      status: "playing",
      difficulty: nextDifficulty,
      board: emptyBoard(r, c),
      firstClickDone: false,
      elapsed: 0,
    });
  }, []);

  // Hydrate from localStorage (or start a fresh game) once, on mount.
  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGame({
        status: saved.status,
        difficulty: saved.difficulty,
        board: saved.board,
        firstClickDone: saved.firstClickDone,
        elapsed: saved.elapsed,
      });
    } else {
      newGame("beginner");
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
    const state: SavedState = { difficulty, board, firstClickDone, elapsed, status };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [loading, difficulty, board, firstClickDone, elapsed, status]);

  const handleReveal = useCallback(
    (r: number, c: number) => {
      if (status !== "playing") return;
      setGame((g) => {
        if (g.board[r][c].flagged) return g;

        // Clicking an already-revealed number "chords" it: if its flagged
        // neighbors already match its count, reveal the rest of them.
        if (g.board[r][c].revealed) {
          const targets = chordTargets(g.board, r, c);
          if (targets.length === 0) return g;

          const hitMine = targets.some(([tr, tc]) => g.board[tr][tc].mine);
          const chordedBoard = chordReveal(g.board, r, c);
          if (hitMine) {
            return { ...g, board: revealAllMines(chordedBoard), status: "lost" };
          }
          return { ...g, board: chordedBoard, status: checkWin(chordedBoard) ? "won" : g.status };
        }

        let nextBoard = g.board;
        let firstClickDone = g.firstClickDone;
        if (!firstClickDone) {
          nextBoard = buildBoard(g.difficulty, r, c);
          firstClickDone = true;
        }

        if (nextBoard[r][c].mine) {
          return {
            ...g,
            board: revealAllMines(revealCell(nextBoard, r, c)),
            firstClickDone,
            status: "lost",
          };
        }

        const revealedBoard = revealCell(nextBoard, r, c);
        return {
          ...g,
          board: revealedBoard,
          firstClickDone,
          status: checkWin(revealedBoard) ? "won" : g.status,
        };
      });
    },
    [status]
  );

  const handleFlag = useCallback(
    (r: number, c: number) => {
      if (status !== "playing") return;
      setGame((g) => {
        if (g.board[r][c].revealed) return g;
        return { ...g, board: toggleFlag(g.board, r, c) };
      });
    },
    [status]
  );

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      // A revealed number can always be chorded, regardless of flag mode —
      // flagging an already-revealed cell would be a no-op anyway.
      if (board[r][c].revealed) {
        handleReveal(r, c);
        return;
      }
      if (flagMode) handleFlag(r, c);
      else handleReveal(r, c);
    },
    [flagMode, handleFlag, handleReveal, board]
  );

  const handleCellContextMenu = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      handleFlag(r, c);
    },
    [handleFlag]
  );

  const handleGiveUp = useCallback(() => {
    setGame((g) => (g.status === "playing" ? { ...g, board: revealAllMines(g.board), status: "revealed" } : g));
  }, []);

  const flagsUsed = useMemo(() => countFlags(board), [board]);
  const minesLeft = mines - flagsUsed;
  const cellPx = CELL_PX[difficulty];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <FiRefreshCw className="animate-spin text-[var(--accent)]" size={22} />
        <p
          className="text-[var(--dim)] text-[11px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Laying mines…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Difficulty tabs */}
      <div className="flex items-center gap-1 border border-[var(--border)] p-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => newGame(d.key)}
            className={`px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
              difficulty === d.key
                ? "bg-[var(--accent)] text-[var(--bg)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
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
            className="text-[var(--text)] text-lg tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatTime(elapsed)}
          </span>
          <span
            className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Time
          </span>
        </div>
        <div className="w-px h-8 bg-[var(--border)]" />
        <div className="flex flex-col items-center">
          <span
            className={`text-lg tabular-nums ${minesLeft < 0 ? "text-[var(--error)]" : "text-[var(--text)]"}`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {minesLeft}
          </span>
          <span
            className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Mines left
          </span>
        </div>
        <div className="w-px h-8 bg-[var(--border)]" />
        <div className="flex flex-col items-center">
          <span
            className="text-[var(--text)] text-lg tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {rows}×{cols}
          </span>
          <span
            className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Grid
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="relative max-w-full overflow-x-auto">
        <MinesweeperBoard
          board={board}
          cellPx={cellPx}
          interactive={status === "playing"}
          onCellClick={handleCellClick}
          onCellContextMenu={handleCellContextMenu}
          dimmed={ended}
        />

        {(status === "won" || status === "lost" || status === "revealed") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/90 backdrop-blur-sm">
            <p
              className="text-2xl"
              style={{
                fontFamily: "var(--font-playfair)",
                fontStyle: "italic",
                fontWeight: 600,
                color: status === "won" ? "var(--accent)" : "var(--error)",
              }}
            >
              {status === "won" ? "Cleared" : status === "lost" ? "Boom" : "Revealed"}
            </p>
            {status === "won" && (
              <p
                className="text-[var(--muted)] text-[12px] tracking-[0.1em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatTime(elapsed)}
              </p>
            )}
            <button
              type="button"
              onClick={() => newGame(difficulty)}
              className="mt-4 px-5 py-2 text-[11px] tracking-[0.18em] uppercase text-[var(--bg)] bg-[var(--accent)] hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Play again
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setFlagMode((v) => !v)}
          disabled={status !== "playing"}
          aria-pressed={flagMode}
          className={`flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase border transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
            flagMode
              ? "text-[var(--bg)] bg-[var(--accent)] border-[var(--accent)]"
              : "text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]/40"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiFlag size={13} /> Flag mode
        </button>
        <button
          type="button"
          onClick={handleGiveUp}
          disabled={status !== "playing"}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--error)] hover:border-[var(--error)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiEye size={13} /> Reveal
        </button>
        <button
          type="button"
          onClick={() => newGame(difficulty)}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--bg)] bg-[var(--accent)] hover:opacity-90 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          New game
        </button>
      </div>

      <p
        className="text-[var(--dim)] text-[10px] tracking-[0.1em] text-center max-w-xs"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Right-click to flag on desktop, or toggle Flag mode on touch devices. Click a revealed
        number once you&apos;ve flagged all its mines to reveal the rest of its neighbors at once.
      </p>
    </div>
  );
}
