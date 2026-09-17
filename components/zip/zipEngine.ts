// Pure Zip logic: Hamiltonian-path puzzle generation (with a few walls for
// flavor) and path-building validation. No React here.

export type Difficulty = "small" | "medium" | "large";

export const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; walls: number; clues: number }> = {
  // Bigger boards, more walls (chokepoints that force a specific route),
  // and fewer numbered clues relative to board size — sparser clues mean
  // more of the route has to be worked out rather than just followed.
  small: { size: 6, walls: 9, clues: 4 },
  medium: { size: 7, walls: 14, clues: 5 },
  large: { size: 8, walls: 20, clues: 6 },
};

export type Cell = [number, number];

export type Puzzle = {
  size: number;
  /** The full Hamiltonian path used to generate the puzzle (one valid
   * solution among possibly several) — used for the hint fallback. */
  solutionPath: Cell[];
  /** "r,c" -> clue number, for the handful of numbered cells. */
  numbers: Map<string, number>;
  maxNumber: number;
  /** Canonical "r1,c1|r2,c2" edge keys that are walled off. */
  walls: Set<string>;
};

export function key(r: number, c: number): string {
  return `${r},${c}`;
}

export function edgeKey(a: Cell, b: Cell): string {
  const ka = key(a[0], a[1]);
  const kb = key(b[0], b[1]);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

export function neighbors(r: number, c: number, size: number): Cell[] {
  const out: Cell[] = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < size - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < size - 1) out.push([r, c + 1]);
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Randomized Warnsdorff-style backtracking search for a Hamiltonian path
 * covering the whole grid: at each step, among unvisited neighbors, favor
 * ones with fewer onward options (they're more likely to get stranded
 * later), breaking ties randomly. Retries from a few random start cells.
 */
function findHamiltonianPath(size: number): Cell[] | null {
  const total = size * size;
  let budget = 120_000;

  function search(start: Cell): Cell[] | null {
    const visited = new Set<string>([key(start[0], start[1])]);
    const path: Cell[] = [start];

    function degree(cell: Cell): number {
      let d = 0;
      for (const n of neighbors(cell[0], cell[1], size)) {
        if (!visited.has(key(n[0], n[1]))) d++;
      }
      return d;
    }

    function backtrack(): boolean {
      if (budget-- <= 0) return false;
      if (path.length === total) return true;
      const current = path[path.length - 1];
      const candidates = shuffle(neighbors(current[0], current[1], size)).filter(
        (n) => !visited.has(key(n[0], n[1]))
      );
      candidates.sort((a, b) => degree(a) - degree(b));

      for (const next of candidates) {
        visited.add(key(next[0], next[1]));
        path.push(next);
        if (backtrack()) return true;
        path.pop();
        visited.delete(key(next[0], next[1]));
      }
      return false;
    }

    return backtrack() ? [...path] : null;
  }

  const starts = shuffle(
    Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => [r, c] as Cell)).flat()
  ).slice(0, 8);

  for (const start of starts) {
    const result = search(start);
    if (result) return result;
  }
  return null;
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const { size, walls: wallCount, clues } = DIFFICULTY_CONFIG[difficulty];

  let solutionPath: Cell[] | null = null;
  for (let attempt = 0; attempt < 6 && !solutionPath; attempt++) {
    solutionPath = findHamiltonianPath(size);
  }
  if (!solutionPath) {
    // Deterministic boustrophedon fallback — always a valid Hamiltonian path.
    solutionPath = [];
    for (let r = 0; r < size; r++) {
      if (r % 2 === 0) for (let c = 0; c < size; c++) solutionPath.push([r, c]);
      else for (let c = size - 1; c >= 0; c--) solutionPath.push([r, c]);
    }
  }

  const total = size * size;
  const numbers = new Map<string, number>();
  const indices: number[] = [];
  for (let i = 0; i < clues; i++) {
    indices.push(Math.round((i * (total - 1)) / (clues - 1)));
  }
  const uniqueSorted = Array.from(new Set(indices)).sort((a, b) => a - b);
  uniqueSorted.forEach((idx, i) => {
    const [r, c] = solutionPath![idx];
    numbers.set(key(r, c), i + 1);
  });
  const maxNumber = uniqueSorted.length;

  // Edges the solution path uses can't be walled off; everything else is fair game.
  const usedEdges = new Set<string>();
  for (let i = 0; i < solutionPath.length - 1; i++) usedEdges.add(edgeKey(solutionPath[i], solutionPath[i + 1]));

  const allEdges: [Cell, Cell][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r < size - 1) allEdges.push([[r, c], [r + 1, c]]);
      if (c < size - 1) allEdges.push([[r, c], [r, c + 1]]);
    }
  }
  const candidateEdges = shuffle(allEdges.filter(([a, b]) => !usedEdges.has(edgeKey(a, b))));
  const walls = new Set(candidateEdges.slice(0, wallCount).map(([a, b]) => edgeKey(a, b)));

  return { size, solutionPath, numbers, maxNumber, walls };
}

export function wallBetween(a: Cell, b: Cell, walls: Set<string>): boolean {
  return walls.has(edgeKey(a, b));
}

/** Is `next` a legal continuation of `path` under this puzzle's rules? */
export function isValidMove(puzzle: Puzzle, path: Cell[], next: Cell): boolean {
  if (path.length === 0) {
    return puzzle.numbers.get(key(next[0], next[1])) === 1;
  }
  const last = path[path.length - 1];
  const isNeighbor = neighbors(last[0], last[1], puzzle.size).some((n) => n[0] === next[0] && n[1] === next[1]);
  if (!isNeighbor) return false;
  if (wallBetween(last, next, puzzle.walls)) return false;
  if (path.some((p) => p[0] === next[0] && p[1] === next[1])) return false;

  const nextNumber = puzzle.numbers.get(key(next[0], next[1]));
  if (nextNumber !== undefined) {
    const lastNumberSeen = highestNumberOnPath(puzzle, path);
    if (nextNumber !== lastNumberSeen + 1) return false;
  }
  return true;
}

export function highestNumberOnPath(puzzle: Puzzle, path: Cell[]): number {
  let max = 0;
  for (const [r, c] of path) {
    const n = puzzle.numbers.get(key(r, c));
    if (n !== undefined) max = Math.max(max, n);
  }
  return max;
}

export function isWinningPath(puzzle: Puzzle, path: Cell[]): boolean {
  if (path.length !== puzzle.size * puzzle.size) return false;
  const last = path[path.length - 1];
  return puzzle.numbers.get(key(last[0], last[1])) === puzzle.maxNumber;
}
