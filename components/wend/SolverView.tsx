"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiRefreshCw } from "react-icons/fi";
import { Cell, Difficulty, Puzzle, generatePuzzle } from "./wendEngine";
import { solvePuzzle, SolverStep } from "./solver";
import WendBoard from "./WendBoard";

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];

const SPEEDS = [
  { key: "slow", label: "Slow", ms: 900 },
  { key: "normal", label: "Normal", ms: 450 },
  { key: "fast", label: "Fast", ms: 150 },
] as const;

const CELL_PX: Record<Difficulty, number> = {
  small: 62,
  medium: 54,
  large: 48,
};

export default function SolverView() {
  const [difficulty, setDifficulty] = useState<Difficulty>("small");
  const [speedKey, setSpeedKey] = useState<(typeof SPEEDS)[number]["key"]>("normal");
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [steps, setSteps] = useState<SolverStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  const run = useCallback((nextDifficulty: Difficulty) => {
    setLoading(true);
    setAutoPlay(false);
    window.setTimeout(() => {
      const p = generatePuzzle(nextDifficulty);
      setPuzzle(p);
      setSteps(solvePuzzle(p));
      setStepIndex(0);
      setLoading(false);
      setAutoPlay(true);
    }, 20);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run("small");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atEnd = steps.length > 0 && stepIndex >= steps.length - 1;
  const speedMs = SPEEDS.find((s) => s.key === speedKey)!.ms;

  useEffect(() => {
    if (!autoPlay || loading || atEnd || steps.length === 0) return;
    const id = window.setTimeout(() => setStepIndex((i) => Math.min(i + 1, steps.length - 1)), speedMs);
    return () => window.clearTimeout(id);
  }, [autoPlay, loading, atEnd, steps.length, stepIndex, speedMs]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [stepIndex]);

  const { solvedIds, revealedCells } = useMemo(() => {
    const solved = new Set<number>();
    const cellsByWord: Record<number, number> = {};
    for (let i = 0; i <= stepIndex && i < steps.length; i++) {
      const s = steps[i];
      cellsByWord[s.wordId] = (cellsByWord[s.wordId] ?? 0) + 1;
      if (s.completesWord) solved.add(s.wordId);
    }
    return { solvedIds: solved, revealedCells: cellsByWord };
  }, [steps, stepIndex]);

  const step = steps[stepIndex];

  const hintCells: Cell[] = useMemo(() => {
    if (!puzzle) return [];
    return puzzle.words
      .filter((w) => !solvedIds.has(w.id))
      .flatMap((w) => w.path.slice(0, revealedCells[w.id] ?? 0));
  }, [puzzle, solvedIds, revealedCells]);

  if (loading || !puzzle || !step) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <FiRefreshCw className="animate-spin text-[var(--accent)]" size={22} />
        <p className="text-[var(--dim)] text-[11px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Solving…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex items-center gap-1 border border-[var(--border)] p-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => {
              setDifficulty(d.key);
              run(d.key);
            }}
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
            {stepIndex + 1} / {steps.length}
          </span>
          <span className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
            Step
          </span>
        </div>
        <div className="w-px h-8 bg-[var(--border)]" />
        <div className="flex flex-col items-center">
          <span className="text-[var(--text)] text-lg tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
            {solvedIds.size} / {puzzle.words.length}
          </span>
          <span className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
            Words found
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 w-full justify-center">
        <div className="relative max-w-full overflow-x-auto">
          <WendBoard
            rows={puzzle.rows}
            cols={puzzle.cols}
            letters={puzzle.letters}
            words={puzzle.words}
            solvedIds={solvedIds}
            selection={[]}
            hintCells={hintCells}
            cellPx={CELL_PX[difficulty]}
            dimmed={atEnd}
          />

          {atEnd && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/90 backdrop-blur-sm">
              <p
                className="text-2xl"
                style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 600, color: "var(--accent)" }}
              >
                Solved
              </p>
              <button
                type="button"
                onClick={() => run(difficulty)}
                className="mt-4 px-5 py-2 text-[11px] tracking-[0.18em] uppercase text-[var(--bg)] bg-[var(--accent)] hover:opacity-90 transition-opacity"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                New puzzle
              </button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[280px] flex flex-col gap-2">
          <span className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Reasoning
          </span>
          <div ref={logRef} className="h-[220px] overflow-y-auto border border-[var(--border)] bg-[var(--surface)]/60 p-3 flex flex-col gap-2">
            {steps.slice(0, stepIndex + 1).map((s, i) => (
              <p
                key={i}
                className="text-[11px] leading-relaxed"
                style={{ fontFamily: "var(--font-mono)", color: i === stepIndex ? "var(--text)" : "var(--dim)" }}
              >
                <span className="text-[var(--accent)]">Letter reveal</span> — {s.message}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setAutoPlay(false);
            setStepIndex((i) => Math.max(0, i - 1));
          }}
          disabled={stepIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiSkipBack size={13} /> Prev
        </button>
        <button
          type="button"
          onClick={() => setAutoPlay((v) => !v)}
          disabled={atEnd}
          className="flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--bg)] bg-[var(--accent)] hover:opacity-90 transition-opacity duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {autoPlay ? <FiPause size={13} /> : <FiPlay size={13} />} {autoPlay ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAutoPlay(false);
            setStepIndex((i) => Math.min(steps.length - 1, i + 1));
          }}
          disabled={atEnd}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]/40 transition-colors duration-200 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Next <FiSkipForward size={13} />
        </button>
        <button
          type="button"
          onClick={() => run(difficulty)}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]/40 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <FiRefreshCw size={13} /> New puzzle
        </button>
      </div>

      <div className="flex items-center gap-1 border border-[var(--border)] p-1">
        {SPEEDS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSpeedKey(s.key)}
            className={`px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
              speedKey === s.key ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-[var(--dim)] text-[10px] tracking-[0.1em] text-center max-w-md" style={{ fontFamily: "var(--font-mono)" }}>
        Words are revealed shortest first, one letter per step; a color fills in once a word completes.
      </p>
    </div>
  );
}
