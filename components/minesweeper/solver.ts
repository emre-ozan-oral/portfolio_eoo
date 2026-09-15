// Minesweeper solver: constraint-satisfaction deduction (single-point +
// subset rule) with a brute-force probability fallback for guesses. Pure
// logic — produces a full step-by-step trace for a UI to play back. No
// React here.

import {
  Board,
  Difficulty,
  DIFFICULTY_CONFIG,
  buildBoard,
  cloneBoard,
  revealCell,
  revealAllMines,
  checkWin,
  neighborsOf,
} from "./minesweeperEngine";

export type SolverStepKind =
  | "first-click"
  | "single-point-safe"
  | "single-point-mine"
  | "subset-safe"
  | "subset-mine"
  | "guess"
  | "win"
  | "loss"
  | "aborted";

export type SolverStep = {
  kind: SolverStepKind;
  board: Board;
  /** The revealed numbered cell(s) whose constraint drove this step. */
  sourceCells: [number, number][];
  /** The cell(s) revealed or flagged as a result of this step. */
  targetCells: [number, number][];
  message: string;
  /** Only set on "guess" / the final "loss" step: mine probability per unrevealed cell. */
  probabilities?: Record<string, number>;
};

export type SolverResult = {
  steps: SolverStep[];
  outcome: "won" | "lost" | "aborted";
};

function key(r: number, c: number): string {
  return `${r},${c}`;
}

type Constraint = {
  r: number;
  c: number;
  cells: [number, number][]; // hidden, unflagged neighbors
  remaining: number; // mines still to be found among `cells`
};

function buildConstraints(board: Board, rows: number, cols: number): Constraint[] {
  const constraints: Constraint[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.revealed || cell.mine || cell.adjacent === 0) continue;
      const neighbors = neighborsOf(r, c, rows, cols);
      const flagged = neighbors.filter(([nr, nc]) => board[nr][nc].flagged).length;
      const hidden = neighbors.filter(([nr, nc]) => !board[nr][nc].revealed && !board[nr][nc].flagged);
      const remaining = cell.adjacent - flagged;
      if (hidden.length > 0 && remaining >= 0 && remaining <= hidden.length) {
        constraints.push({ r, c, cells: hidden, remaining });
      }
    }
  }
  return constraints;
}

type Deduction = {
  kind: "single-point-safe" | "single-point-mine" | "subset-safe" | "subset-mine";
  sourceCells: [number, number][];
  targetCells: [number, number][];
  message: string;
};

/** Rule 1: a revealed N with N flags around it clears the rest; a revealed
 * N whose hidden-neighbor count exactly matches its remaining mine count
 * means all of them are mines. */
function findSinglePointDeduction(board: Board, rows: number, cols: number): Deduction | null {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.revealed || cell.mine || cell.adjacent === 0) continue;

      const neighbors = neighborsOf(r, c, rows, cols);
      const flagged = neighbors.filter(([nr, nc]) => board[nr][nc].flagged).length;
      const hidden = neighbors.filter(([nr, nc]) => !board[nr][nc].revealed && !board[nr][nc].flagged);
      if (hidden.length === 0) continue;

      const remaining = cell.adjacent - flagged;

      if (remaining === 0) {
        return {
          kind: "single-point-safe",
          sourceCells: [[r, c]],
          targetCells: hidden,
          message: `(${r + 1}, ${c + 1}) = ${cell.adjacent} already has all ${cell.adjacent} of its mines flagged — its remaining ${hidden.length} hidden neighbor${hidden.length === 1 ? " is" : "s are"} safe.`,
        };
      }

      if (remaining === hidden.length) {
        return {
          kind: "single-point-mine",
          sourceCells: [[r, c]],
          targetCells: hidden,
          message: `(${r + 1}, ${c + 1}) = ${cell.adjacent} has exactly ${hidden.length} hidden neighbor${hidden.length === 1 ? "" : "s"} left for ${remaining} more mine${remaining === 1 ? "" : "s"} — all of them must be mines.`,
        };
      }
    }
  }
  return null;
}

/** Rule 2: when one constraint's cell set is a proper subset of another's,
 * the difference in their mine counts resolves the cells only the larger
 * constraint touches. */
function findSubsetDeduction(board: Board, rows: number, cols: number): Deduction | null {
  const constraints = buildConstraints(board, rows, cols).filter(
    (con) => con.remaining > 0 && con.remaining < con.cells.length
  );
  if (constraints.length < 2) return null;

  const byCell = new Map<string, number[]>();
  constraints.forEach((con, idx) => {
    for (const [r, c] of con.cells) {
      const k = key(r, c);
      const list = byCell.get(k);
      if (list) list.push(idx);
      else byCell.set(k, [idx]);
    }
  });

  const considered = new Set<string>();

  for (const idxs of byCell.values()) {
    for (const ai of idxs) {
      for (const bi of idxs) {
        if (ai === bi) continue;
        const a = constraints[ai];
        const b = constraints[bi];
        if (a.cells.length >= b.cells.length) continue; // want a proper subset of b
        const pairKey = `${ai}-${bi}`;
        if (considered.has(pairKey)) continue;
        considered.add(pairKey);

        const bSet = new Set(b.cells.map(([r, c]) => key(r, c)));
        const isSubset = a.cells.every(([r, c]) => bSet.has(key(r, c)));
        if (!isSubset) continue;

        const aSet = new Set(a.cells.map(([r, c]) => key(r, c)));
        const diffCells = b.cells.filter(([r, c]) => !aSet.has(key(r, c)));
        const diffCount = b.remaining - a.remaining;
        if (diffCells.length === 0) continue;

        if (diffCount === 0) {
          return {
            kind: "subset-safe",
            sourceCells: [
              [a.r, a.c],
              [b.r, b.c],
            ],
            targetCells: diffCells,
            message: `(${a.r + 1}, ${a.c + 1}) already accounts for all of (${b.r + 1}, ${b.c + 1})'s remaining mines — the ${diffCells.length} extra cell${diffCells.length === 1 ? "" : "s"} only (${b.r + 1}, ${b.c + 1}) touches must be safe.`,
          };
        }
        if (diffCount === diffCells.length) {
          return {
            kind: "subset-mine",
            sourceCells: [
              [a.r, a.c],
              [b.r, b.c],
            ],
            targetCells: diffCells,
            message: `Comparing (${a.r + 1}, ${a.c + 1}) and (${b.r + 1}, ${b.c + 1}): the ${diffCells.length} extra cell${diffCells.length === 1 ? "" : "s"} beyond (${a.r + 1}, ${a.c + 1}) must all be mines.`,
          };
        }
      }
    }
  }
  return null;
}

function applyDeduction(board: Board, deduction: Deduction): Board {
  if (deduction.kind === "single-point-safe" || deduction.kind === "subset-safe") {
    let next = board;
    for (const [r, c] of deduction.targetCells) {
      if (!next[r][c].revealed) next = revealCell(next, r, c);
    }
    return next;
  }
  const next = cloneBoard(board);
  for (const [r, c] of deduction.targetCells) {
    next[r][c] = { ...next[r][c], flagged: true };
  }
  return next;
}

type ComponentResult = {
  cells: [number, number][];
  mineCounts: number[];
  totalAssignments: number;
};

/** Brute-force (pruned) enumeration of every mine layout consistent with
 * the constraints touching one connected frontier component. */
function enumerateComponent(cells: [number, number][], constraints: Constraint[]): ComponentResult {
  const n = cells.length;
  const indexOf = new Map<string, number>();
  cells.forEach(([r, c], i) => indexOf.set(key(r, c), i));

  const compConstraints = constraints.map((con) => ({
    indices: con.cells.map(([r, c]) => indexOf.get(key(r, c))!),
    remaining: con.remaining,
  }));

  const assignment = new Array<boolean>(n).fill(false);
  const mineCounts = new Array<number>(n).fill(0);
  let totalAssignments = 0;

  const SAFETY_LIMIT = 2_000_000;
  let visited = 0;
  let aborted = false;

  function consistent(depth: number): boolean {
    for (const con of compConstraints) {
      let assigned = 0;
      let decided = 0;
      for (const idx of con.indices) {
        if (idx < depth) {
          decided++;
          if (assignment[idx]) assigned++;
        }
      }
      const undecided = con.indices.length - decided;
      if (assigned > con.remaining) return false;
      if (assigned + undecided < con.remaining) return false;
    }
    return true;
  }

  function backtrack(depth: number) {
    if (aborted) return;
    visited++;
    if (visited > SAFETY_LIMIT) {
      aborted = true;
      return;
    }
    if (depth === n) {
      for (const con of compConstraints) {
        let assigned = 0;
        for (const idx of con.indices) if (assignment[idx]) assigned++;
        if (assigned !== con.remaining) return;
      }
      totalAssignments++;
      for (let i = 0; i < n; i++) if (assignment[i]) mineCounts[i]++;
      return;
    }
    for (const val of [false, true]) {
      assignment[depth] = val;
      if (consistent(depth + 1)) backtrack(depth + 1);
      if (aborted) return;
    }
  }

  backtrack(0);

  if (aborted || totalAssignments === 0) {
    // Enumeration was infeasible or found nothing consistent (shouldn't
    // happen on a real board) — fall back to each constraint's local ratio.
    const avgRatio =
      compConstraints.reduce((sum, con) => sum + con.remaining / Math.max(1, con.indices.length), 0) /
      Math.max(1, compConstraints.length);
    return {
      cells,
      mineCounts: cells.map(() => Math.round(avgRatio * 1000)),
      totalAssignments: 1000,
    };
  }

  return { cells, mineCounts, totalAssignments };
}

type Guess = {
  cell: { r: number; c: number };
  probability: number;
  probabilities: Record<string, number>;
};

/** No certain move exists — estimate each hidden cell's mine probability
 * and return the safest one to try. */
function computeGuess(board: Board, rows: number, cols: number, totalMines: number): Guess | null {
  const constraints = buildConstraints(board, rows, cols).filter(
    (con) => con.remaining > 0 && con.remaining < con.cells.length
  );

  const unknown: [number, number][] = [];
  let flaggedCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.flagged) flaggedCount++;
      else if (!cell.revealed) unknown.push([r, c]);
    }
  }
  if (unknown.length === 0) return null;

  const frontierSet = new Set<string>();
  for (const con of constraints) for (const [r, c] of con.cells) frontierSet.add(key(r, c));

  const frontierCells = unknown.filter(([r, c]) => frontierSet.has(key(r, c)));
  const interiorCells = unknown.filter(([r, c]) => !frontierSet.has(key(r, c)));

  const probabilities: Record<string, number> = {};

  if (frontierCells.length === 0) {
    const p = Math.min(1, Math.max(0, (totalMines - flaggedCount) / unknown.length));
    for (const [r, c] of unknown) probabilities[key(r, c)] = p;
  } else {
    const parent = new Map<string, string>();
    function find(x: string): string {
      let root = x;
      while (parent.get(root) && parent.get(root) !== root) root = parent.get(root)!;
      parent.set(x, root);
      return root;
    }
    function union(x: string, y: string) {
      const rx = find(x);
      const ry = find(y);
      if (rx !== ry) parent.set(rx, ry);
    }
    for (const [r, c] of frontierCells) {
      const k = key(r, c);
      if (!parent.has(k)) parent.set(k, k);
    }
    for (const con of constraints) {
      const keys = con.cells.map(([r, c]) => key(r, c)).filter((k) => parent.has(k));
      for (let i = 1; i < keys.length; i++) union(keys[0], keys[i]);
    }

    const groups = new Map<string, [number, number][]>();
    for (const [r, c] of frontierCells) {
      const root = find(key(r, c));
      const list = groups.get(root);
      if (list) list.push([r, c]);
      else groups.set(root, [[r, c]]);
    }

    let expectedFrontierMines = 0;

    for (const cells of groups.values()) {
      const cellKeys = new Set(cells.map(([r, c]) => key(r, c)));
      const relevant = constraints.filter((con) => con.cells.some(([r, c]) => cellKeys.has(key(r, c))));
      const result = enumerateComponent(cells, relevant);
      for (let i = 0; i < result.cells.length; i++) {
        const [r, c] = result.cells[i];
        const p = result.mineCounts[i] / result.totalAssignments;
        probabilities[key(r, c)] = p;
        expectedFrontierMines += p;
      }
    }

    if (interiorCells.length > 0) {
      const remainingMines = Math.max(0, totalMines - flaggedCount - expectedFrontierMines);
      const p = Math.min(1, Math.max(0, remainingMines / interiorCells.length));
      for (const [r, c] of interiorCells) probabilities[key(r, c)] = p;
    }
  }

  let best: { r: number; c: number } | null = null;
  let bestP = Infinity;
  for (const [r, c] of unknown) {
    const p = probabilities[key(r, c)] ?? 0.5;
    if (p < bestP) {
      bestP = p;
      best = { r, c };
    }
  }
  if (!best) return null;

  return { cell: best, probability: bestP, probabilities };
}

/**
 * Solves a fresh board of `difficulty` end-to-end and returns the full
 * step trace: single-point deductions, then subset deductions, then (when
 * no certain move exists) a probability-weighted guess. Fully synchronous
 * and deterministic given the board's random mine layout, so a UI can
 * compute it once and play the trace back at its own pace.
 */
export function solveBoard(difficulty: Difficulty, firstClick?: [number, number]): SolverResult {
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];
  const [fr, fc] = firstClick ?? [Math.floor(rows / 2), Math.floor(cols / 2)];

  let board = buildBoard(difficulty, fr, fc);
  board = revealCell(board, fr, fc);

  const steps: SolverStep[] = [
    {
      kind: "first-click",
      board: cloneBoard(board),
      sourceCells: [],
      targetCells: [[fr, fc]],
      message: `First click at (${fr + 1}, ${fc + 1}) — mines are placed only after this click, so it's always safe.`,
    },
  ];

  const MAX_STEPS = 4000;

  while (steps.length < MAX_STEPS) {
    if (checkWin(board)) {
      steps.push({
        kind: "win",
        board: cloneBoard(board),
        sourceCells: [],
        targetCells: [],
        message: "Every safe cell is revealed — solved with logic alone, no lucky guesses needed.",
      });
      return { steps, outcome: "won" };
    }

    const singlePoint = findSinglePointDeduction(board, rows, cols);
    if (singlePoint) {
      board = applyDeduction(board, singlePoint);
      steps.push({ ...singlePoint, board: cloneBoard(board) });
      continue;
    }

    const subset = findSubsetDeduction(board, rows, cols);
    if (subset) {
      board = applyDeduction(board, subset);
      steps.push({ ...subset, board: cloneBoard(board) });
      continue;
    }

    const guess = computeGuess(board, rows, cols, mines);
    if (!guess) break;

    const { r, c } = guess.cell;
    if (board[r][c].mine) {
      board = revealAllMines(revealCell(board, r, c));
      steps.push({
        kind: "loss",
        board: cloneBoard(board),
        sourceCells: [],
        targetCells: [[r, c]],
        message: `No certain move left. The safest guess was (${r + 1}, ${c + 1}) at ${(guess.probability * 100).toFixed(0)}% mine risk — this time it was a mine.`,
        probabilities: guess.probabilities,
      });
      return { steps, outcome: "lost" };
    }

    board = revealCell(board, r, c);
    steps.push({
      kind: "guess",
      board: cloneBoard(board),
      sourceCells: [],
      targetCells: [[r, c]],
      message: `No certain move left. Guessed (${r + 1}, ${c + 1}) — the safest option at ${(guess.probability * 100).toFixed(0)}% mine risk — and it was clear.`,
      probabilities: guess.probabilities,
    });
  }

  steps.push({
    kind: "aborted",
    board: cloneBoard(board),
    sourceCells: [],
    targetCells: [],
    message: "Stopped after an unusually long run.",
  });
  return { steps, outcome: "aborted" };
}
