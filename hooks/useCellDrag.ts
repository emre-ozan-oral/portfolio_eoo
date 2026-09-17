"use client";

import { useCallback, useRef } from "react";

// Shared hold-and-drag gesture for grid-of-buttons puzzle boards (Zip,
// Wend, Queens): resolves whichever cell the pointer is physically over
// via `document.elementFromPoint`, rather than relying on per-cell
// mouseenter — which is what lets one continuous drag paint or extend a
// path across cells on both mouse and touch. Cells must carry
// `data-r`/`data-c` attributes for a wrapping element the pointer is over
// to be resolvable.
//
// `onCellDown` fires once, immediately, for the cell the gesture starts
// on (a plain tap is just a down+up with no intervening move).
// `onCellEnter` fires for every *new* cell the pointer moves onto while
// held down (deduplicated — re-entering the same cell repeatedly doesn't
// re-fire). `onCellUp(dragged)` fires on release; `dragged` is false when
// the pointer never left the starting cell.

type CellDragHandlers = {
  onCellDown: (r: number, c: number) => void;
  onCellEnter: (r: number, c: number) => void;
  onCellUp: (startR: number, startC: number, dragged: boolean) => void;
};

function resolveCell(el: Element | null): [number, number] | null {
  const cellEl = el?.closest<HTMLElement>("[data-r][data-c]");
  if (!cellEl) return null;
  const r = Number(cellEl.dataset.r);
  const c = Number(cellEl.dataset.c);
  if (Number.isNaN(r) || Number.isNaN(c)) return null;
  return [r, c];
}

export function useCellDrag({ onCellDown, onCellEnter, onCellUp }: CellDragHandlers) {
  const state = useRef({ active: false, startR: -1, startC: -1, lastR: -1, lastC: -1, dragged: false });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const cell = resolveCell(e.target as Element);
      if (!cell) return;
      const [r, c] = cell;
      state.current = { active: true, startR: r, startC: c, lastR: r, lastC: c, dragged: false };
      onCellDown(r, c);
    },
    [onCellDown]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!state.current.active) return;
      const cell = resolveCell(document.elementFromPoint(e.clientX, e.clientY));
      if (!cell) return;
      const [r, c] = cell;
      if (r === state.current.lastR && c === state.current.lastC) return;

      // First move away from the start cell: the start cell itself joins
      // the drag too (so e.g. Queens' paint mode covers the cell you
      // pressed down on, not just the ones you dragged over after it).
      if (!state.current.dragged) {
        state.current.dragged = true;
        onCellEnter(state.current.startR, state.current.startC);
      }
      state.current.lastR = r;
      state.current.lastC = c;
      onCellEnter(r, c);
    },
    [onCellEnter]
  );

  const endDrag = useCallback(() => {
    if (!state.current.active) return;
    const { startR, startC, dragged } = state.current;
    state.current.active = false;
    onCellUp(startR, startC, dragged);
  }, [onCellUp]);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}
