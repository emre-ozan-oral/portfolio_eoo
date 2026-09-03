// Pure Sudoku logic: generation, solving, validation. No React here.

export type Cell = number; // 0 = empty, 1-9 = filled
export type Board = Cell[][]; // 9x9
export type Difficulty = "easy" | "normal" | "hard";

export const SIZE = 9;
const BOX = 3;

export const CLUE_TARGET: Record<Difficulty, number> = {
  easy: 40,
  normal: 32,
  hard: 26,
};

function boxOf(r: number, c: number): number {
  return Math.floor(r / BOX) * BOX + Math.floor(c / BOX);
}

function popcount(n: number): number {
  let count = 0;
  while (n) {
    n &= n - 1;
    count++;
  }
  return count;
}

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

function buildMasks(board: Board) {
  const row = new Array(SIZE).fill(0);
  const col = new Array(SIZE).fill(0);
  const box = new Array(SIZE).fill(0);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const d = board[r][c];
      if (d) {
        const bit = 1 << (d - 1);
        row[r] |= bit;
        col[c] |= bit;
        box[boxOf(r, c)] |= bit;
      }
    }
  }
  return { row, col, box };
}

/** Find the empty cell with the fewest legal candidates (MRV heuristic). */
function findMRVCell(
  board: Board,
  row: number[],
  col: number[],
  box: number[]
): { r: number; c: number; mask: number } | null {
  let best: { r: number; c: number; mask: number } | null = null;
  let bestCount = 10;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== 0) continue;
      const mask = 0x1ff & ~(row[r] | col[c] | box[boxOf(r, c)]);
      const count = popcount(mask);
      if (count === 0) return { r, c, mask };
      if (count < bestCount) {
        bestCount = count;
        best = { r, c, mask };
        if (count === 1) return best;
      }
    }
  }
  return best;
}

/** Generates a complete, randomly-filled, valid 9x9 solution grid. */
export function generateSolvedBoard(): Board {
  const board = emptyBoard();
  const { row, col, box } = buildMasks(board);

  function fill(): boolean {
    const cell = findMRVCell(board, row, col, box);
    if (!cell) return true; // every cell filled
    const { r, c, mask } = cell;
    if (mask === 0) return false;
    const digits = shuffled(
      Array.from({ length: 9 }, (_, i) => i + 1).filter((d) => mask & (1 << (d - 1)))
    );
    for (const d of digits) {
      const bit = 1 << (d - 1);
      board[r][c] = d;
      row[r] |= bit;
      col[c] |= bit;
      box[boxOf(r, c)] |= bit;
      if (fill()) return true;
      board[r][c] = 0;
      row[r] &= ~bit;
      col[c] &= ~bit;
      box[boxOf(r, c)] &= ~bit;
    }
    return false;
  }

  fill();
  return board;
}

/** Counts solutions for a partially-filled board, stopping early at `cap`. */
export function countSolutions(input: Board, cap = 2): number {
  const board = cloneBoard(input);
  const { row, col, box } = buildMasks(board);
  let count = 0;

  function solve(): void {
    if (count >= cap) return;
    const cell = findMRVCell(board, row, col, box);
    if (!cell) {
      count++;
      return;
    }
    const { r, c, mask } = cell;
    if (mask === 0) return;
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << (d - 1);
      if (!(mask & bit)) continue;
      board[r][c] = d;
      row[r] |= bit;
      col[c] |= bit;
      box[boxOf(r, c)] |= bit;
      solve();
      board[r][c] = 0;
      row[r] &= ~bit;
      col[c] &= ~bit;
      box[boxOf(r, c)] &= ~bit;
      if (count >= cap) return;
    }
  }

  solve();
  return count;
}

/**
 * Builds a puzzle by digging holes out of a full solution while
 * repeatedly verifying the remaining grid still has exactly one
 * solution, down to (roughly) the clue count for the requested
 * difficulty.
 */
export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateSolvedBoard();
  const puzzle = cloneBoard(solution);
  const target = CLUE_TARGET[difficulty];

  const positions = shuffled(Array.from({ length: SIZE * SIZE }, (_, i) => i));
  let clues = SIZE * SIZE;

  for (const pos of positions) {
    if (clues <= target) break;
    const r = Math.floor(pos / SIZE);
    const c = pos % SIZE;
    if (puzzle[r][c] === 0) continue;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    if (countSolutions(puzzle, 2) === 1) {
      clues--;
    } else {
      puzzle[r][c] = backup;
    }
  }

  return { puzzle, solution };
}

/** True if `value` at (r, c) conflicts with another cell sharing its row/col/box. */
export function hasConflict(board: Board, r: number, c: number): boolean {
  const value = board[r][c];
  if (!value) return false;
  for (let i = 0; i < SIZE; i++) {
    if (i !== c && board[r][i] === value) return true;
    if (i !== r && board[i][c] === value) return true;
  }
  const br = Math.floor(r / BOX) * BOX;
  const bc = Math.floor(c / BOX) * BOX;
  for (let dr = 0; dr < BOX; dr++) {
    for (let dc = 0; dc < BOX; dc++) {
      const rr = br + dr;
      const cc = bc + dc;
      if ((rr !== r || cc !== c) && board[rr][cc] === value) return true;
    }
  }
  return false;
}

export function isBoardComplete(board: Board): boolean {
  return board.every((row) => row.every((v) => v !== 0));
}

export function boardsEqual(a: Board, b: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
