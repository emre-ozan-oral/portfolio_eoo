// Zip solver: at each step, checks which legal continuations still leave
// the rest of the grid reachable as one connected region (a necessary
// condition for finishing the Hamiltonian path). When exactly one survives,
// that's a forced move; otherwise it falls back to the generated solution.

import { Cell, Puzzle, key, isValidMove, isWinningPath, neighbors, wallBetween } from "./zipEngine";

export type StepKind = "start" | "forced" | "fallback" | "win";

export type SolverStep = {
  kind: StepKind;
  message: string;
  path: Cell[];
};

/** True if every currently-unvisited cell can still be reached from the
 * others (ignoring order/number constraints) — a necessary condition for
 * a Hamiltonian continuation to exist. */
function unvisitedIsConnected(puzzle: Puzzle, visited: Set<string>): boolean {
  const unvisited: Cell[] = [];
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      if (!visited.has(key(r, c))) unvisited.push([r, c]);
    }
  }
  if (unvisited.length === 0) return true;

  const seen = new Set<string>([key(unvisited[0][0], unvisited[0][1])]);
  const stack: Cell[] = [unvisited[0]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    for (const [nr, nc] of neighbors(r, c, puzzle.size)) {
      const k = key(nr, nc);
      if (visited.has(k) || seen.has(k)) continue;
      if (wallBetween([r, c], [nr, nc], puzzle.walls)) continue;
      seen.add(k);
      stack.push([nr, nc]);
    }
  }
  return seen.size === unvisited.length;
}

function feasibleContinuation(puzzle: Puzzle, path: Cell[], candidate: Cell): boolean {
  const trial = [...path, candidate];
  const visited = new Set(trial.map(([r, c]) => key(r, c)));
  if (visited.size === puzzle.size * puzzle.size) return isWinningPath(puzzle, trial);

  if (!unvisitedIsConnected(puzzle, visited)) return false;
  // The candidate must still have somewhere left to go.
  return neighbors(candidate[0], candidate[1], puzzle.size).some(
    (n) => !visited.has(key(n[0], n[1])) && !wallBetween(candidate, n, puzzle.walls)
  );
}

/** Returns the single next forced step, or null if the current position is
 * genuinely ambiguous from local reasoning alone. */
export function findNextStep(puzzle: Puzzle, path: Cell[]): SolverStep | null {
  if (path.length === 0) {
    const start = [...puzzle.numbers.entries()].find(([, n]) => n === 1)![0].split(",").map(Number) as Cell;
    return {
      kind: "start",
      message: `The path must begin at 1, the only cell that can legally start it — (${start[0] + 1}, ${start[1] + 1}).`,
      path: [start],
    };
  }

  const last = path[path.length - 1];
  const raw = neighbors(last[0], last[1], puzzle.size).filter((n) => isValidMove(puzzle, path, n));
  const feasible = raw.filter((n) => feasibleContinuation(puzzle, path, n));

  if (feasible.length === 1) {
    const [tr, tc] = feasible[0];
    const reason =
      raw.length > 1
        ? `${raw.length - 1} of the other neighbor${raw.length - 1 === 1 ? "" : "s"} would cut off part of the grid from the rest of the path`
        : "it's the only unvisited neighbor available";
    return {
      kind: "forced",
      message: `From (${last[0] + 1}, ${last[1] + 1}), ${reason} — the path must continue to (${tr + 1}, ${tc + 1}).`,
      path: [...path, feasible[0]],
    };
  }

  return null;
}

/** Falls back to the generated solution's next cell when local reasoning
 * can't narrow it to one move. */
export function fallbackStep(puzzle: Puzzle, path: Cell[]): SolverStep | null {
  const idx = path.length;
  if (idx >= puzzle.solutionPath.length) return null;
  const [tr, tc] = puzzle.solutionPath[idx];
  return {
    kind: "fallback",
    message: `Multiple continuations stay locally feasible from here — following the generated route, the next cell is (${tr + 1}, ${tc + 1}).`,
    path: [...path, [tr, tc] as Cell],
  };
}

export function nextHint(puzzle: Puzzle, path: Cell[]): SolverStep | null {
  return findNextStep(puzzle, path) ?? fallbackStep(puzzle, path);
}

/** Solves a fresh puzzle end-to-end for the "Watch solver" demo tab. */
export function solvePuzzle(puzzle: Puzzle): SolverStep[] {
  const steps: SolverStep[] = [];
  let path: Cell[] = [];
  const total = puzzle.size * puzzle.size;

  while (path.length < total) {
    const step = nextHint(puzzle, path);
    if (!step) break;
    path = step.path;
    steps.push(step);
  }
  if (path.length === total && isWinningPath(puzzle, path)) {
    steps.push({ kind: "win", message: "Every cell is visited exactly once, ending on the highest number — solved.", path });
  }
  return steps;
}
