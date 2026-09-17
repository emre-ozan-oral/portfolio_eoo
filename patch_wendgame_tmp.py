import re
p = "components/wend/WendGame.tsx"
s = open(p, encoding="utf-8").read()

old = 'import { useCallback, useEffect, useState } from "react";'
new = 'import { useCallback, useEffect, useRef, useState } from "react";'
assert s.count(old) == 1
s = s.replace(old, new)

old = '''  const [selection, setSelection] = useState<Cell[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());'''
new = '''  const [selection, setSelection] = useState<Cell[]>([]);
  // Mirrors `selection`/`solvedIds` synchronously. A hold-and-drag can fire
  // several cell events within a single native pointer event (the drag's
  // start cell, then wherever it moved to); handleCellClick needs the
  // *result* of the first of those to validate the second, but the state
  // variables themselves won't reflect that update until React re-renders
  // -- reading and writing these refs instead keeps every call within the
  // same gesture consistent, even back-to-back before a render happens.
  const selectionRef = useRef<Cell[]>([]);
  const applySelection = useCallback((next: Cell[]) => {
    selectionRef.current = next;
    setSelection(next);
  }, []);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const solvedIdsRef = useRef<Set<number>>(new Set());
  const applySolvedIds = useCallback((next: Set<number>) => {
    solvedIdsRef.current = next;
    setSolvedIds(next);
  }, []);'''
assert s.count(old) == 1
s = s.replace(old, new)

old = '''  const newGame = useCallback((nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty);
    setPuzzle(generatePuzzle(nextDifficulty));
    setSelection([]);
    setSolvedIds(new Set());
    setRevealed({});
    setWon(false);
    setHintMessage(null);
    setCooldownUntil(0);
  }, []);'''
new = '''  const newGame = useCallback(
    (nextDifficulty: Difficulty) => {
      setDifficulty(nextDifficulty);
      setPuzzle(generatePuzzle(nextDifficulty));
      applySelection([]);
      applySolvedIds(new Set());
      setRevealed({});
      setWon(false);
      setHintMessage(null);
      setCooldownUntil(0);
    },
    [applySelection, applySolvedIds]
  );'''
assert s.count(old) == 1
s = s.replace(old, new)

old = '''  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (!puzzle || won) return;
      if (puzzle.letters[r][c] === null) return;
      const wid = wordIdAtCell(puzzle.words, r, c);
      if (wid !== undefined && solvedIds.has(wid)) return;

      let nextSelection: Cell[];
      if (selection.length === 0) {
        nextSelection = [[r, c]];
      } else {
        const last = selection[selection.length - 1];
        if (last[0] === r && last[1] === c) {
          nextSelection = selection.slice(0, -1);
        } else {
          const idx = selection.findIndex(([sr, sc]) => sr === r && sc === c);
          if (idx !== -1) {
            nextSelection = selection.slice(0, idx + 1);
          } else if (areOrthogonallyAdjacent(last, [r, c])) {
            nextSelection = [...selection, [r, c]];
          } else {
            nextSelection = [[r, c]];
          }
        }
      }

      setHintMessage(null);
      const matched = puzzle.words.find((w) => !solvedIds.has(w.id) && selectionMatchesWord(nextSelection, w));
      if (matched) {
        const nextSolved = new Set(solvedIds);
        nextSolved.add(matched.id);
        setSolvedIds(nextSolved);
        setSelection([]);
        if (allWordsSolved(puzzle, nextSolved)) setWon(true);
      } else {
        setSelection(nextSelection);
      }
    },
    [puzzle, won, selection, solvedIds]
  );'''
new = '''  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (!puzzle || won) return;
      if (puzzle.letters[r][c] === null) return;
      const currentSolved = solvedIdsRef.current;
      const wid = wordIdAtCell(puzzle.words, r, c);
      if (wid !== undefined && currentSolved.has(wid)) return;

      const currentSelection = selectionRef.current;
      let nextSelection: Cell[];
      if (currentSelection.length === 0) {
        nextSelection = [[r, c]];
      } else {
        const last = currentSelection[currentSelection.length - 1];
        if (last[0] === r && last[1] === c) {
          nextSelection = currentSelection.slice(0, -1);
        } else {
          const idx = currentSelection.findIndex(([sr, sc]) => sr === r && sc === c);
          if (idx !== -1) {
            nextSelection = currentSelection.slice(0, idx + 1);
          } else if (areOrthogonallyAdjacent(last, [r, c])) {
            nextSelection = [...currentSelection, [r, c]];
          } else {
            nextSelection = [[r, c]];
          }
        }
      }

      setHintMessage(null);
      const matched = puzzle.words.find((w) => !currentSolved.has(w.id) && selectionMatchesWord(nextSelection, w));
      if (matched) {
        const nextSolved = new Set(currentSolved);
        nextSolved.add(matched.id);
        applySolvedIds(nextSolved);
        applySelection([]);
        if (allWordsSolved(puzzle, nextSolved)) setWon(true);
      } else {
        applySelection(nextSelection);
      }
    },
    [puzzle, won, applySelection, applySolvedIds]
  );'''
assert s.count(old) == 1
s = s.replace(old, new)

old = '''  const handleHint = useCallback(() => {
    if (!puzzle || won || onCooldown) return;
    const step = nextHint(puzzle, solvedIds, revealed);
    if (!step) return;

    setRevealed((prev) => ({ ...prev, [step.wordId]: (prev[step.wordId] ?? 0) + 1 }));
    setHintMessage(step.message);
    setCooldownUntil(Date.now() + HINT_COOLDOWN_MS);
    setNow(Date.now());

    if (step.completesWord) {
      const nextSolved = new Set(solvedIds);
      nextSolved.add(step.wordId);
      setSolvedIds(nextSolved);
      setSelection((sel) => sel.filter(([r, c]) => wordIdAtCell(puzzle.words, r, c) !== step.wordId));
      if (allWordsSolved(puzzle, nextSolved)) setWon(true);
    }
  }, [puzzle, won, onCooldown, solvedIds, revealed]);'''
new = '''  const handleHint = useCallback(() => {
    if (!puzzle || won || onCooldown) return;
    const step = nextHint(puzzle, solvedIdsRef.current, revealed);
    if (!step) return;

    setRevealed((prev) => ({ ...prev, [step.wordId]: (prev[step.wordId] ?? 0) + 1 }));
    setHintMessage(step.message);
    setCooldownUntil(Date.now() + HINT_COOLDOWN_MS);
    setNow(Date.now());

    if (step.completesWord) {
      const nextSolved = new Set(solvedIdsRef.current);
      nextSolved.add(step.wordId);
      applySolvedIds(nextSolved);
      applySelection(selectionRef.current.filter(([r, c]) => wordIdAtCell(puzzle.words, r, c) !== step.wordId));
      if (allWordsSolved(puzzle, nextSolved)) setWon(true);
    }
  }, [puzzle, won, onCooldown, revealed, applySolvedIds, applySelection]);'''
assert s.count(old) == 1
s = s.replace(old, new)

old = 'onClick={() => setSelection([])}'
new = 'onClick={() => applySelection([])}'
assert s.count(old) == 1
s = s.replace(old, new)

open(p, "w", encoding="utf-8").write(s)
print("patched")
