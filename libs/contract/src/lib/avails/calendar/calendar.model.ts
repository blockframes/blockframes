
export type CellState = 'empty' | 'avail' | 'sold';
export type SelectionState = 'waiting' | 'started' | 'selected';
export interface MatrixPosition {
  row: number;
  column: number;
}

export interface AvailCalendarState {
  selectionState: SelectionState;

  hoverColumn: number;
  hoverRow: number;

  hoverStart: MatrixPosition;
  hoverEnd: MatrixPosition;

  start: MatrixPosition;
  end: MatrixPosition;

  highlightedRange: boolean[][];
}


/**
 * Check if `start` point is before `end` point.
 *
 * Returns `true` if `start` is before `end` and `false` otherwise
 * @example
 * // |A|B|C|
 * // |D|E|F|
 * // |G|H|I|
 * isBefore(A, E); // true
 * isBefore(H, C); // false
 */
export function isBefore(start: Readonly<MatrixPosition>, end: Readonly<MatrixPosition>) {
  return start.row < end.row || (start.row === end.row && start.column < end.column);
}


export function isContinuous(start: Readonly<MatrixPosition>, end: Readonly<MatrixPosition>, stateMatrix: readonly CellState[][]) {

  if (stateMatrix[start.row][start.column] !== 'avail') return false;
  if (stateMatrix[end.row][end.column] !== 'avail') return false;

  if (isBefore(end, start)) return false;


  // Checking if a range is continuous:
  // Ex:
  // | | |x|-|-|-|-|-|
  // |-|-|-|-|-|-|-|-|
  // |-|-|-|-|x| | | |

  for (let row = start.row ; row <= end.row ; row++) {

    // partial line: | | |x|-|-|-|x| |
    if (row === start.row && row === end.row) {
      for (let column = start.column ; column <= end.column ; column++) {
        if (stateMatrix[row][column] !== 'avail') return false;
      }

    // partial line (from start): | | |x|-|-|-|-|-|
    } else if (row === start.row) {
      for (let column = start.column ; column < stateMatrix[0].length ; column++) {
        if (stateMatrix[row][column] !== 'avail') return false;
      }

    // partial line (to end): |-|-|-|-|-|-|x| |
    } else if (row === end.row) {
      for (let column = 0 ; column <= end.column ; column++) {
        if (stateMatrix[row][column] !== 'avail') return false;
      }

    // full line: |-|-|-|-|-|-|-|-|
    } else {
      for (let column = 0 ; column < stateMatrix[0].length ; column++) {
        if (stateMatrix[row][column] !== 'avail') return false;
      }
    }
  }

  return true;
}

export function resetHighlight(state: Readonly<AvailCalendarState>): AvailCalendarState {
  return {
    ...state,
    highlightedRange: state.highlightedRange.map(highlightedRow => highlightedRow.map(_ => false)),
  };
}

export function highlightRange(start: Readonly<MatrixPosition>, end: Readonly<MatrixPosition>, stateMatrix: readonly CellState[][], state: Readonly<AvailCalendarState>): AvailCalendarState {
  const localState = resetHighlight(state);

  for (let row = start.row ; row <= end.row ; row++) {
    for (let column = 0 ; column < stateMatrix[0].length ; column++) {
      if (
        (row === start.row && row === end.row && column >= start.column && column <= end.column) || // same line range
        (row === start.row && row !== end.row && column >= start.column) || // multi-line start-line
        (row !== start.row && row === end.row && column <= end.column) || // multi-line end-line
        (row > start.row && row < end.row) // multi-line full-line
      ) {
        localState.highlightedRange[row][column] = true;
      }
    }
  }

  return localState;
}

export function reset(state: Readonly<AvailCalendarState>): AvailCalendarState {

  let localState = {
    ...state,
    hoverColumn: undefined,
    hoverRow: undefined,
    hoverStart: { row: undefined, column: undefined },
    hoverEnd: { row: undefined, column: undefined },
  };

  if (state.selectionState !== 'selected') localState = resetHighlight(localState);

  return localState;
}

export function hover(row: number, column: number, stateMatrix: readonly CellState[][], state: Readonly<AvailCalendarState>): AvailCalendarState {

  let localState = { ...state };

  if (stateMatrix[row][column] === 'avail') {

    localState.hoverColumn = column;
    localState.hoverRow = row;

    if (state.selectionState === 'waiting' || state.selectionState === 'selected') {
      if (row === state.start.row && column === state.start.column) return localState; // don't put hover on start position
      if (row === state.end.row && column === state.end.column) return localState; // don't put hover on end position
      localState.hoverStart = { row, column };

    } else if (state.selectionState === 'started') {

      if (row === state.start.row && column === state.start.column) return localState; // don't put hover on start position

      else if (isContinuous(state.start, { row, column }, stateMatrix)) {
        localState.hoverEnd = { row, column };
        localState = highlightRange(localState.start, { row, column }, stateMatrix, localState);

      } else {
        localState.hoverStart = { row, column };
      }
    }
  }

  return localState;
}

export function select(row: number, column: number, stateMatrix: readonly CellState[][], state: Readonly<AvailCalendarState>): AvailCalendarState {

  const localState = { ...state };

  if (stateMatrix[row][column] !== 'avail') return localState;

  if (state.selectionState === 'waiting') {
    localState.selectionState = 'started';
    localState.start = { row, column };
    localState.hoverStart = { row: undefined, column: undefined };

  } else if (state.selectionState === 'started') {

    if (isContinuous(state.start, { row, column }, stateMatrix)) {
      localState.selectionState = 'selected';
      localState.end = { row, column };
      localState.hoverEnd = { row: undefined, column: undefined };

    } else {
      localState.start = { row, column };
      localState.hoverStart = { row: undefined, column: undefined };
    }
  } else {
    localState.selectionState = 'started';
    localState.start = { row, column };
    localState.hoverStart = { row: undefined, column: undefined };
    localState.hoverEnd = { row: undefined, column: undefined };
    localState.end = { row: undefined, column: undefined };
  }

  return localState;
}


