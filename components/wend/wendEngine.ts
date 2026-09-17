// Pure Wend logic: partitions a grid into self-avoiding letter paths that
// spell a set of words, leaving any leftover cells blocked. No React here.

import { WORDS_BY_LENGTH } from "./wordlists";

export type Difficulty = "small" | "medium" | "large";

export const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; lengths: number[] }> = {
  small: { rows: 3, cols: 5, lengths: [3, 4, 5] },
  medium: { rows: 4, cols: 6, lengths: [3, 4, 5, 6] },
  large: { rows: 4, cols: 7, lengths: [4, 5, 6, 7] },
};

export type Cell = [number, number];

export type PlantedWord = {
  id: number;
  text: string;
  length: number;
  path: Cell[];
};

export type Puzzle = {
  rows: number;
  cols: number;
  /** null = blocked (unused) cell. */
  letters: (string | null)[][];
  words: PlantedWord[];
};

export function key(r: number, c: number): string {
  return `${r},${c}`;
}

export function pathKeySet(path: Cell[]): Set<string> {
  return new Set(path.map(([r, c]) => key(r, c)));
}

function neighbors4(r: number, c: number, rows: number, cols: number): Cell[] {
  const out: Cell[] = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < rows - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < cols - 1) out.push([r, c + 1]);
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

/** Randomized self-avoiding walk of exactly `length` cells through
 * currently-unoccupied cells, or null if it gets stuck within budget. */
function findWordPath(occupied: boolean[][], rows: number, cols: number, length: number): Cell[] | null {
  const empties: Cell[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!occupied[r][c]) empties.push([r, c]);
  const starts = shuffle(empties);
  let budget = 4000;

  for (const start of starts) {
    const visited = new Set<string>([key(start[0], start[1])]);
    const path: Cell[] = [start];

    function backtrack(): boolean {
      if (budget-- <= 0) return false;
      if (path.length === length) return true;
      const [r, c] = path[path.length - 1];
      const candidates = shuffle(neighbors4(r, c, rows, cols)).filter(
        (n) => !occupied[n[0]][n[1]] && !visited.has(key(n[0], n[1]))
      );
      for (const next of candidates) {
        visited.add(key(next[0], next[1]));
        path.push(next);
        if (backtrack()) return true;
        path.pop();
        visited.delete(key(next[0], next[1]));
      }
      return false;
    }

    if (backtrack()) return [...path];
    if (budget <= 0) break;
  }
  return null;
}

/** Straight-line fallback: lays each word along its own row starting at
 * column 0. Always succeeds given this module's grid dimensions (rows =
 * word count, cols >= the longest word length). */
function straightLineFallback(rows: number, cols: number, lengths: number[]): Cell[][] {
  return lengths.map((len, r) => Array.from({ length: len }, (_, c) => [r, c] as Cell));
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const { rows, cols, lengths } = DIFFICULTY_CONFIG[difficulty];

  let placedPaths: Cell[][] | null = null;
  let chosenWords: string[] = [];

  for (let attempt = 0; attempt < 30 && !placedPaths; attempt++) {
    const occupied: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    const order = [...lengths].sort((a, b) => b - a); // place the hardest (longest) words first
    const paths: Cell[][] = [];
    const wordsUsed: string[] = [];
    let ok = true;

    for (const length of order) {
      const candidates = shuffle(WORDS_BY_LENGTH[length].filter((w) => !wordsUsed.includes(w)));
      let placed: Cell[] | null = null;
      let word = "";
      for (const candidate of candidates.slice(0, 6)) {
        const path = findWordPath(occupied, rows, cols, length);
        if (path) {
          placed = path;
          word = candidate;
          break;
        }
      }
      if (!placed) {
        ok = false;
        break;
      }
      for (const [r, c] of placed) occupied[r][c] = true;
      paths.push(placed);
      wordsUsed.push(word);
    }

    if (ok) {
      placedPaths = paths;
      chosenWords = wordsUsed;
    }
  }

  if (!placedPaths) {
    const order = [...lengths].sort((a, b) => b - a);
    placedPaths = straightLineFallback(rows, cols, order);
    chosenWords = order.map((len) => WORDS_BY_LENGTH[len][Math.floor(Math.random() * WORDS_BY_LENGTH[len].length)]);
  }

  const letters: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const words: PlantedWord[] = placedPaths.map((path, id) => {
    const text = chosenWords[id];
    path.forEach(([r, c], i) => {
      letters[r][c] = text[i];
    });
    return { id, text, length: text.length, path };
  });

  // Words were placed longest-first; sort the returned list ascending so
  // the UI (and hints) naturally lead with the easiest, shortest word.
  words.sort((a, b) => a.length - b.length);

  return { rows, cols, letters, words };
}

export function wordIdAtCell(words: PlantedWord[], r: number, c: number): number | undefined {
  for (const w of words) {
    if (w.path.some(([pr, pc]) => pr === r && pc === c)) return w.id;
  }
  return undefined;
}

export function areOrthogonallyAdjacent(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

/** A selection matches a word if it covers exactly that word's cells,
 * traced in either direction. */
export function selectionMatchesWord(selection: Cell[], word: PlantedWord): boolean {
  if (selection.length !== word.path.length) return false;
  const selectionSet = pathKeySet(selection);
  const wordSet = pathKeySet(word.path);
  if (selectionSet.size !== wordSet.size) return false;
  for (const k of wordSet) if (!selectionSet.has(k)) return false;
  return true;
}
