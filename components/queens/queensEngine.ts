// Pure Queens logic: puzzle generation (regions + a guaranteed solution),
// mark state, and win/conflict checking. No React here.

export type Difficulty = "small" | "medium" | "large";

export const DIFFICULTY_CONFIG: Record<Difficulty, { n: number }> = {
  small: { n: 6 },
  medium: { n: 8 },
  large: { n: 10 },
};

export type Mark = "empty" | "x" | "queen";

export type Puzzle = {
  n: number;
  /** regions[r][c] = region id (0..n-1) that cell (r, c) belongs to. */
  regions: number[][];
  /** solutionCols[r] = the column holding the queen in row r, for the
   * generated (not necessarily unique) solution. Used as a hint fallback. */
  solutionCols: number[];
};

export type Marks = Mark[][];

function shuffledRange(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** A random permutation of columns, one per row, such that no two queens
 * in adjacent rows sit in adjacent columns (diagonal touch). Columns are
 * already distinct by construction, so that's the only extra check needed. */
function randomNonTouchingPermutation(n: number): number[] {
  for (let attempt = 0; attempt < 500; attempt++) {
    const perm = shuffledRange(n);
    let ok = true;
    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(perm[i] - perm[i + 1]) === 1) {
        ok = false;
        break;
      }
    }
    if (ok) return perm;
  }
  // Fallback: a hand-built permutation that never has adjacent columns
  // touch across adjacent rows (spreads by roughly half the board width).
  const half = Math.ceil(n / 2);
  const perm: number[] = [];
  for (let i = 0; i < n; i++) perm.push(i % 2 === 0 ? i / 2 : half + (i - 1) / 2);
  return perm;
}

/** Grows `n` connected regions outward from the solution's queen cells
 * until every cell on the board belongs to exactly one region. */
function growRegions(n: number, solutionCols: number[]): number[][] {
  const regions: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  type Frontier = { r: number; c: number; region: number };
  let frontier: Frontier[] = [];

  for (let region = 0; region < n; region++) {
    const r = region;
    const c = solutionCols[region];
    regions[r][c] = region;
    frontier.push({ r, c, region });
  }

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (frontier.length > 0) {
    // Shuffle so growth is organic rather than always favoring one region.
    for (let i = frontier.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [frontier[i], frontier[j]] = [frontier[j], frontier[i]];
    }
    const next: Frontier[] = [];
    for (const { r, c, region } of frontier) {
      for (const [dr, dc] of dirs) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
        if (regions[rr][cc] !== -1) continue;
        regions[rr][cc] = region;
        next.push({ r: rr, c: cc, region });
      }
    }
    // Any cells still unclaimed after this pass need another round; cells
    // claimed this round seed the next frontier.
    frontier = next;
    if (frontier.length === 0) {
      // Check for stragglers (isolated unassigned cells boxed in) and
      // attach each to a random already-assigned neighbor's region.
      let attachedAny = false;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (regions[r][c] !== -1) continue;
          for (const [dr, dc] of dirs) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
            if (regions[rr][cc] !== -1) {
              regions[r][c] = regions[rr][cc];
              frontier.push({ r, c, region: regions[r][c] });
              attachedAny = true;
              break;
            }
          }
        }
      }
      if (!attachedAny) break;
    }
  }

  return regions;
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const { n } = DIFFICULTY_CONFIG[difficulty];
  const solutionCols = randomNonTouchingPermutation(n);
  const regions = growRegions(n, solutionCols);
  return { n, regions, solutionCols };
}

export function emptyMarks(n: number): Marks {
  return Array.from({ length: n }, () => Array<Mark>(n).fill("empty"));
}

export function cloneMarks(marks: Marks): Marks {
  return marks.map((row) => [...row]);
}

/** Tap cycle: empty -> x -> queen -> empty. */
export function cycleMark(marks: Marks, r: number, c: number): Marks {
  const next = cloneMarks(marks);
  const cur = next[r][c];
  next[r][c] = cur === "empty" ? "x" : cur === "x" ? "queen" : "empty";
  return next;
}

export function setMark(marks: Marks, r: number, c: number, mark: Mark): Marks {
  const next = cloneMarks(marks);
  next[r][c] = mark;
  return next;
}

export function queenPositions(marks: Marks): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < marks.length; r++) {
    for (let c = 0; c < marks[r].length; c++) {
      if (marks[r][c] === "queen") out.push([r, c]);
    }
  }
  return out;
}

function touching(a: [number, number], b: [number, number]): boolean {
  return Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;
}

/** Returns the set of queen cells (as "r,c" keys) that violate a
 * row/column/region/adjacency constraint, for live conflict highlighting. */
export function findConflicts(marks: Marks, regions: number[][]): Set<string> {
  const queens = queenPositions(marks);
  const conflicts = new Set<string>();

  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const a = queens[i];
      const b = queens[j];
      const sameRow = a[0] === b[0];
      const sameCol = a[1] === b[1];
      const sameRegion = regions[a[0]][a[1]] === regions[b[0]][b[1]];
      if (sameRow || sameCol || sameRegion || touching(a, b)) {
        conflicts.add(`${a[0]},${a[1]}`);
        conflicts.add(`${b[0]},${b[1]}`);
      }
    }
  }
  return conflicts;
}

export function checkWin(marks: Marks, regions: number[][]): boolean {
  const n = marks.length;
  const queens = queenPositions(marks);
  if (queens.length !== n) return false;
  if (findConflicts(marks, regions).size > 0) return false;

  const rows = new Set(queens.map(([r]) => r));
  const cols = new Set(queens.map(([, c]) => c));
  const regs = new Set(queens.map(([r, c]) => regions[r][c]));
  return rows.size === n && cols.size === n && regs.size === n;
}
