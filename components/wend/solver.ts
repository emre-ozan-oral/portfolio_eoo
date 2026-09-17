// Wend solver: reveals one cell at a time of the shortest not-yet-solved
// word (mirroring the real game's "reveal a letter" hint), auto-completing
// that word once every one of its cells has been shown.

import { Puzzle, PlantedWord } from "./wendEngine";

export type SolverStep = {
  message: string;
  wordId: number;
  /** Index within that word's path that was just revealed. */
  cellIndex: number;
  cell: [number, number];
  completesWord: boolean;
};

/** Picks the easiest (shortest) unsolved word and reveals its next
 * not-yet-shown cell. `revealed[wordId]` tracks how many cells of that
 * word have already been shown by earlier hints. */
export function nextHint(
  puzzle: Puzzle,
  solvedIds: Set<number>,
  revealed: Record<number, number>
): SolverStep | null {
  const target = [...puzzle.words]
    .filter((w) => !solvedIds.has(w.id))
    .sort((a, b) => a.length - b.length)[0];
  if (!target) return null;

  const shown = revealed[target.id] ?? 0;
  const cellIndex = Math.min(shown, target.length - 1);
  const cell = target.path[cellIndex];
  const completesWord = cellIndex === target.length - 1;

  const message =
    cellIndex === 0
      ? `The ${target.length}-letter word starts at (${cell[0] + 1}, ${cell[1] + 1}) with "${target.text[0]}".`
      : completesWord
        ? `Its last letter, "${target.text[cellIndex]}", is at (${cell[0] + 1}, ${cell[1] + 1}) — that completes "${target.text}".`
        : `The next letter, "${target.text[cellIndex]}", is at (${cell[0] + 1}, ${cell[1] + 1}), continuing that word's path.`;

  return { message, wordId: target.id, cellIndex, cell, completesWord };
}

/** Full reveal trace for the "Watch solver" demo tab: every word, shortest
 * first, one cell at a time. */
export function solvePuzzle(puzzle: Puzzle): SolverStep[] {
  const steps: SolverStep[] = [];
  const solved = new Set<number>();
  const revealed: Record<number, number> = {};

  for (const word of [...puzzle.words].sort((a, b) => a.length - b.length)) {
    for (let i = 0; i < word.length; i++) {
      const step = nextHint(puzzle, solved, revealed);
      if (!step) break;
      steps.push(step);
      revealed[step.wordId] = (revealed[step.wordId] ?? 0) + 1;
      if (step.completesWord) solved.add(step.wordId);
    }
  }
  return steps;
}

export function allWordsSolved(puzzle: Puzzle, solvedIds: Set<number>): boolean {
  return puzzle.words.every((w: PlantedWord) => solvedIds.has(w.id));
}
