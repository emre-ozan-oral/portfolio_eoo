"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiRefreshCw } from "react-icons/fi";
import { DIFFICULTY_CONFIG, Difficulty } from "./minesweeperEngine";
import { solveBoard, SolverResult, SolverStep } from "./solver";
import MinesweeperBoard, { CellHighlight } from "./MinesweeperBoard";

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "expert", label: "Expert" },
];

const SPEEDS = [
  { key: "slow", label: "Slow", ms: 1100 },
  { key: "normal", label: "Normal", ms: 500 },
  { key: "fast", label: "Fast", ms: 120 },
] as const;

// Cell pixel size per difficulty — larger boards need smaller cells to stay
// on-screen; the board wrapper also scrolls horizontally as a fallback.
const CELL_PX: Record<Difficulty, number> = {
  beginner: 38,
  intermediate: 30,
  expert: 22,
};

const KIND_LABEL: Partial<Record<SolverStep["kind"], string>> = {
  "first-click": "First click",
  "single-point-safe": "Single-point rule",
  "single-point-mine": "Single-point rule",
  "subset-safe": "Subset rule",
  "subset-mine": "Subset rule",
  guess: "Guess",
  win: "Solved",
  loss: "Lost",
  aborted: "Stopped",
};

export default function SolverView() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [speedKey, setSpeedKey] = useState<(typeof SPEEDS)[number]["key"]>("normal");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  const run = useCallback((nextDifficulty: Difficulty) => {
    setLoading(true);
    setAutoPlay(false);
    setResult(null);
    // Defer so the "Solving…" state paints before the synchronous solve
    // (constraint propagation + probability enumeration) runs.
    window.setTimeout(() => {
      const res = solveBoard(nextDifficulty);
      setResult(res);
      setStepIndex(0);
      setLoading(false);
      setAutoPlay(true);
    }, 20);
  }, []);

  // Solve a beginner board once, on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run("beginner");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = useMemo(() => result?.steps ?? [], [result]);
  const atEnd = steps.length > 0 && stepIndex >= steps.length - 1;
  const speedMs = SPEEDS.find((s) => s.key === speedKey)!.ms;

  // Auto-play: advances one step at a time on a timer.
  useEffect(() => {
    if (!autoPlay || loading || atEnd || steps.length === 0) return;
    const id = window.setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, speedMs);
    return () => window.clearTimeout(id);
  }, [autoPlay, loading, atEnd, steps.length, stepIndex, speedMs]);

  // Keep the log scrolled to the latest entry.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [stepIndex]);

  const step: SolverStep | undefined = steps[stepIndex];

  const highlights = useMemo(() => {
    if (!step) return undefined;
    const map: Record<string, CellHighlight> = {};
    for (const [r, c] of step.sourceCells) map[`${r},${c}`] = "source";
    const targetTag: CellHighlight = step.kind.endsWith("mine")
      ? "mine"
      : step.kind === "guess" || step.kind === "loss"
        ? "guess"
        : "safe";
    for (const [r, c] of step.targetCells) map[`${r},${c}`] = targetTag;
    return map;
  }, [step]);

  const { mines, rows, cols } = DIFFICULTY_CONFIG[difficulty];
  const outcome = result?.outcome;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Difficulty tabs */}
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

      {loading || !step ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <FiRefreshCw className="animate-spin text-[var(--accent)]" size={22} />
          <p
            className="text-[var(--dim)] text-[11px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Solving…
          </p>
        </div>
      ) : (
        <>
          {/* Status row */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span
                className="text-[var(--text)] text-lg tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stepIndex + 1} / {steps.length}
              </span>
              <span
                className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Step
              </span>
            </div>
            <div className="w-px h-8 bg-[var(--border)]" />
            <div className="flex flex-col items-center">
              <span
                className="text-[var(--text)] text-lg tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {mines}
              </span>
              <span
                className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase mt-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Mines
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

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 w-full justify-center">
            {/* Board */}
            <div className="relative max-w-full overflow-x-auto">
              <MinesweeperBoard
                board={step.board}
                cellPx={CELL_PX[difficulty]}
                highlights={highlights}
                probabilities={step.probabilities}
                dimmed={atEnd}
              />

              {atEnd && outcome && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/90 backdrop-blur-sm">
                  <p
                    className="text-2xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontStyle: "italic",
                      fontWeight: 600,
                      color: outcome === "won" ? "var(--accent)" : "var(--error)",
                    }}
                  >
                    {outcome === "won" ? "Solved" : outcome === "lost" ? "Lost" : "Stopped"}
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

            {/* Reasoning log */}
            <div className="w-full lg:w-[280px] flex flex-col gap-2">
              <span
                className="text-[var(--dim)] text-[9px] tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Reasoning
              </span>
              <div
                ref={logRef}
                className="h-[220px] overflow-y-auto border border-[var(--border)] bg-[var(--surface)]/60 p-3 flex flex-col gap-2"
              >
                {steps.slice(0, stepIndex + 1).map((s, i) => (
                  <p
                    key={i}
                    className="text-[11px] leading-relaxed"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: i === stepIndex ? "var(--text)" : "var(--dim)",
                    }}
                  >
                    <span className="text-[var(--accent)]">{KIND_LABEL[s.kind] ?? s.kind}</span> — {s.message}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Playback controls */}
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

          {/* Speed control */}
          <div className="flex items-center gap-1 border border-[var(--border)] p-1">
            {SPEEDS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSpeedKey(s.key)}
                className={`px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
                  speedKey === s.key
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <p
            className="text-[var(--dim)] text-[10px] tracking-[0.1em] text-center max-w-md"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Gold outline = the clue driving the deduction. Green = proven safe, red = proven mine, purple = a
            probability-weighted guess. Numbers on hidden cells during a guess are their estimated mine risk.
          </p>
        </>
      )}
    </div>
  );
}
