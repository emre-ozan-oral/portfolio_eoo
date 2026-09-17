// Queens solver: constraint propagation (row/column/region single-candidate
// rules, plus region-confined-to-a-line elimination) with a known-solution
// fallback when logic alone stalls. Produces single steps for an in-game
// "Hint" button, or a full trace for a "Watch solver" demo.

import { Marks, Puzzle, cloneMarks, queenPositions } from "./queensEngine";

export type StepKind =
  | "row-forced"
  | "col-forced"
  | "region-forced"
  | "line-elimination"
  | "fallback"
  | "win";

export type SolverStep = {
  kind: StepKind;
  message: string;
  sourceCells: [number, number][];
  targetCells: [number, number][];
  marks: Marks;
};

function key(r: number, c: number): string {
  return `${r},${c}`;
}

/** Cells a queen could still legally occupy: not already marked, not in a
 * row/column/region that already has a queen, and not adjacent to one. */
function candidateGrid(marks: Marks, regions: number[][]): boolean[][] {
  const n = marks.length;
  const queens = queenPositions(marks);
  const queenRows = new Set(queens.map(([r]) => r));
  const queenCols = new Set(queens.map(([, c]) => c));
  const queenRegions = new Set(queens.map(([r, c]) => regions[r][c]));

  const candidates: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (marks[r][c] !== "empty") continue;
      if (queenRows.has(r) || queenCols.has(c) || queenRegions.has(regions[r][c])) continue;
      const nearQueen = queens.some(([qr, qc]) => Math.abs(qr - r) <= 1 && Math.abs(qc - c) <= 1);
      if (nearQueen) continue;
      candidates[r][c] = true;
    }
  }
  return candidates;
}

function placeQueen(marks: Marks, r: number, c: number, regions: number[][]): Marks {
  const n = marks.length;
  const next = cloneMarks(marks);
  next[r][c] = "queen";
  // Everything the new queen invalidates gets X'd so the board visibly
  // narrows, same as a human working through the puzzle.
  for (let rr = 0; rr < n; rr++) {
    for (let cc = 0; cc < n; cc++) {
      if (next[rr][cc] !== "empty") continue;
      const sameRow = rr === r;
      const sameCol = cc === c;
      const sameRegion = regions[rr][cc] === regions[r][c];
      const adjacent = Math.abs(rr - r) <= 1 && Math.abs(cc - c) <= 1;
      if (sameRow || sameCol || sameRegion || adjacent) next[rr][cc] = "x";
    }
  }
  return next;
}

/** Finds the single next logical step from the current marks, or null if
 * no direct deduction applies (caller should fall back to the known
 * solution). Does not mutate `marks`. */
export function findNextStep(puzzle: Puzzle, marks: Marks): SolverStep | null {
  const { n, regions } = puzzle;
  const candidates = candidateGrid(marks, regions);
  const queens = queenPositions(marks);
  const queenRows = new Set(queens.map(([r]) => r));
  const queenCols = new Set(queens.map(([, c]) => c));
  const queenRegions = new Set(queens.map(([r, c]) => regions[r][c]));

  // Rule 1: a row with exactly one remaining candidate must take its queen.
  for (let r = 0; r < n; r++) {
    if (queenRows.has(r)) continue;
    const cells: [number, number][] = [];
    for (let c = 0; c < n; c++) if (candidates[r][c]) cells.push([r, c]);
    if (cells.length === 1) {
      const [tr, tc] = cells[0];
      return {
        kind: "row-forced",
        message: `Row ${r + 1} has only one cell left that doesn't conflict with a placed queen — the queen for this row must go at (${tr + 1}, ${tc + 1}).`,
        sourceCells: [],
        targetCells: [cells[0]],
        marks: placeQueen(marks, tr, tc, regions),
      };
    }
  }

  // Rule 2: same, for columns.
  for (let c = 0; c < n; c++) {
    if (queenCols.has(c)) continue;
    const cells: [number, number][] = [];
    for (let r = 0; r < n; r++) if (candidates[r][c]) cells.push([r, c]);
    if (cells.length === 1) {
      const [tr, tc] = cells[0];
      return {
        kind: "col-forced",
        message: `Column ${c + 1} has only one cell left that doesn't conflict with a placed queen — the queen for this column must go at (${tr + 1}, ${tc + 1}).`,
        sourceCells: [],
        targetCells: [cells[0]],
        marks: placeQueen(marks, tr, tc, regions),
      };
    }
  }

  // Rule 3: same, for regions.
  const regionCells = new Map<number, [number, number][]>();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const region = regions[r][c];
      if (queenRegions.has(region)) continue;
      if (!candidates[r][c]) continue;
      const list = regionCells.get(region);
      if (list) list.push([r, c]);
      else regionCells.set(region, [[r, c]]);
    }
  }
  for (const [region, cells] of regionCells) {
    if (cells.length === 1) {
      const [tr, tc] = cells[0];
      return {
        kind: "region-forced",
        message: `Region ${region + 1}'s color has only one cell left that doesn't conflict with a placed queen — its queen must go at (${tr + 1}, ${tc + 1}).`,
        sourceCells: [],
        targetCells: [cells[0]],
        marks: placeQueen(marks, tr, tc, regions),
      };
    }
  }

  // Rule 4: if a region's remaining candidates all sit in one row (or
  // column), that region's queen must land in that row, so every other
  // region's candidates in that row can be crossed out.
  for (const [region, cells] of regionCells) {
    if (cells.length < 2) continue;
    const rows = new Set(cells.map(([r]) => r));
    const cols = new Set(cells.map(([, c]) => c));

    if (rows.size === 1) {
      const row = cells[0][0];
      const toX: [number, number][] = [];
      for (let c = 0; c < n; c++) {
        if (candidates[row][c] && regions[row][c] !== region) toX.push([row, c]);
      }
      if (toX.length > 0) {
        const next = cloneMarks(marks);
        for (const [r, c] of toX) next[r][c] = "x";
        return {
          kind: "line-elimination",
          message: `Every remaining candidate for region ${region + 1}'s color sits in row ${row + 1} — that region's queen must land there, so the other candidates in row ${row + 1} can be ruled out.`,
          sourceCells: cells,
          targetCells: toX,
          marks: next,
        };
      }
    }

    if (cols.size === 1) {
      const col = cells[0][1];
      const toX: [number, number][] = [];
      for (let r = 0; r < n; r++) {
        if (candidates[r][col] && regions[r][col] !== region) toX.push([r, col]);
      }
      if (toX.length > 0) {
        const next = cloneMarks(marks);
        for (const [r, c] of toX) next[r][c] = "x";
        return {
          kind: "line-elimination",
          message: `Every remaining candidate for region ${region + 1}'s color sits in column ${col + 1} — that region's queen must land there, so the other candidates in column ${col + 1} can be ruled out.`,
          sourceCells: cells,
          targetCells: toX,
          marks: next,
        };
      }
    }
  }

  return null;
}

/** Falls back to the generator's known solution when propagation stalls —
 * reveals whichever of its queens isn't placed yet. */
export function fallbackStep(puzzle: Puzzle, marks: Marks): SolverStep | null {
  const { n, regions, solutionCols } = puzzle;
  const queens = new Set(queenPositions(marks).map(([r, c]) => key(r, c)));
  for (let r = 0; r < n; r++) {
    const c = solutionCols[r];
    if (queens.has(key(r, c))) continue;
    return {
      kind: "fallback",
      message: `No direct deduction is available from the current marks — following the generated solution, row ${r + 1}'s queen is at (${r + 1}, ${c + 1}).`,
      sourceCells: [],
      targetCells: [[r, c]],
      marks: placeQueen(marks, r, c, regions),
    };
  }
  return null;
}

export function nextHint(puzzle: Puzzle, marks: Marks): SolverStep | null {
  return findNextStep(puzzle, marks) ?? fallbackStep(puzzle, marks);
}

/** Solves a fresh puzzle end-to-end for the "Watch solver" demo tab. */
export function solvePuzzle(puzzle: Puzzle): SolverStep[] {
  const steps: SolverStep[] = [];
  let marks = require_emptyMarks(puzzle.n);
  const MAX_STEPS = puzzle.n * puzzle.n * 4 + 20;

  while (steps.length < MAX_STEPS) {
    if (queenPositions(marks).length === puzzle.n) {
      steps.push({
        kind: "win",
        message: "Every region, row, and column has exactly one non-touching queen — solved.",
        sourceCells: [],
        targetCells: [],
        marks,
      });
      return steps;
    }
    const step = nextHint(puzzle, marks);
    if (!step) break;
    marks = step.marks;
    steps.push(step);
  }
  return steps;
}

// Local helper kept separate from queensEngine's emptyMarks to avoid a
// circular import concern if this file grows solver-only helpers later.
function require_emptyMarks(n: number): Marks {
  return Array.from({ length: n }, () => Array(n).fill("empty"));
}
