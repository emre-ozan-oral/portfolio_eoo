// Pure Minesweeper logic: board generation, mine placement, flood reveal,
// win detection. No React here.

export type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number; // count of neighboring mines (meaningless while mine is true)
};

export type Board = Cell[][];
export type Difficulty = "beginner" | "intermediate" | "expert";

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { rows: number; cols: number; mines: number }
> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

export function neighborsOf(r: number, c: number, rows: number, cols: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr;
      const cc = c + dc;
      if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) out.push([rr, cc]);
    }
  }
  return out;
}

export function emptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * Builds a fresh board for `difficulty` with mines placed, guaranteed to
 * keep (safeR, safeC) and its immediate neighbors mine-free so the first
 * click of a game never loses.
 */
export function buildBoard(difficulty: Difficulty, safeR: number, safeC: number): Board {
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];
  const board = emptyBoard(rows, cols);

  const safeZone = new Set<string>([`${safeR},${safeC}`]);
  for (const [r, c] of neighborsOf(safeR, safeC, rows, cols)) safeZone.add(`${r},${c}`);

  const positions: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safeZone.has(`${r},${c}`)) positions.push([r, c]);
    }
  }

  // Fisher-Yates shuffle, then take the first `mines` positions.
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  for (let i = 0; i < mines && i < positions.length; i++) {
    const [r, c] = positions[i];
    board[r][c].mine = true;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (const [nr, nc] of neighborsOf(r, c, rows, cols)) {
        if (board[nr][nc].mine) count++;
      }
      board[r][c].adjacent = count;
    }
  }

  return board;
}

/**
 * Reveals (r, c) and, if it has no adjacent mines, cascades outward to
 * reveal the connected region of zero-adjacency cells and their border.
 * Returns a new board; does not mutate the input.
 */
export function revealCell(board: Board, r: number, c: number): Board {
  const next = cloneBoard(board);
  const rows = next.length;
  const cols = next[0].length;
  if (next[r][c].revealed || next[r][c].flagged) return next;

  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = next[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (!cell.mine && cell.adjacent === 0) {
      for (const [nr, nc] of neighborsOf(cr, cc, rows, cols)) {
        if (!next[nr][nc].revealed && !next[nr][nc].flagged) stack.push([nr, nc]);
      }
    }
  }
  return next;
}

/** Reveals every mine (used on loss/give-up). */
export function revealAllMines(board: Board): Board {
  const next = cloneBoard(board);
  for (const row of next) {
    for (const cell of row) {
      if (cell.mine) cell.revealed = true;
    }
  }
  return next;
}

/**
 * "Chording": clicking a revealed number whose flagged-neighbor count
 * already matches its own number reveals the rest of its hidden,
 * unflagged neighbors at once — the classic Minesweeper shortcut for
 * clearing cells you've already worked out are safe. Returns the empty
 * list when the cell isn't eligible (unrevealed, blank, a mine, or its
 * flag count doesn't match yet).
 */
export function chordTargets(board: Board, r: number, c: number): [number, number][] {
  const rows = board.length;
  const cols = board[0].length;
  const cell = board[r][c];
  if (!cell.revealed || cell.mine || cell.adjacent === 0) return [];

  const neighbors = neighborsOf(r, c, rows, cols);
  const flagged = neighbors.filter(([nr, nc]) => board[nr][nc].flagged).length;
  if (flagged !== cell.adjacent) return [];

  return neighbors.filter(([nr, nc]) => !board[nr][nc].revealed && !board[nr][nc].flagged);
}

/** Reveals every chord target for (r, c). If a flag was wrong, this can
 * reveal a mine — same risk as the real shortcut takes. */
export function chordReveal(board: Board, r: number, c: number): Board {
  let next = board;
  for (const [nr, nc] of chordTargets(board, r, c)) {
    if (!next[nr][nc].revealed) next = revealCell(next, nr, nc);
  }
  return next;
}

export function toggleFlag(board: Board, r: number, c: number): Board {
  const next = cloneBoard(board);
  if (next[r][c].revealed) return next;
  next[r][c].flagged = !next[r][c].flagged;
  return next;
}

export function countFlags(board: Board): number {
  let count = 0;
  for (const row of board) for (const cell of row) if (cell.flagged) count++;
  return count;
}

/** Win = every non-mine cell has been revealed (classic Minesweeper rule). */
export function checkWin(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
