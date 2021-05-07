
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { calendarAvails } from '../fixtures/calendar';


type CellState = 'empty' | 'avail' | 'sold';
type SelectionState = 'waiting' | 'started' | 'selected';
interface MatrixPosition {
  row: number;
  column: number;
}

interface AvailCalendarState {
  selectionState: SelectionState;

  hoverColumn: number;
  hoverRow: number;

  hoverStart: MatrixPosition;
  hoverEnd: MatrixPosition;

  start: MatrixPosition;
  end: MatrixPosition;

  highlightedRange: boolean[][];
}

@Component({
  selector: '[durationMarkers] avails-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: [ './calendar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailsCalendarComponent implements OnInit {

  public columns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  public rows = Array(10).fill(0).map((_,i) => new Date().getFullYear() + i); // [ 2021, 2022, ... 2030 ]

  public stateMatrix: CellState[][] = [];

  public state$ = new BehaviorSubject<AvailCalendarState>({
    selectionState: 'waiting',

    hoverColumn: undefined,
    hoverRow: undefined,

    hoverStart: { row: undefined, column: undefined },
    hoverEnd: { row: undefined, column: undefined },

    start: { row: undefined, column: undefined },
    end: { row: undefined, column: undefined },

    highlightedRange: [],
  });

  @Input() set durationMarkers(value: any) {
    // TODO REMOVE FIXTURE AND CONVERT MARKERS INTO CELL-STATE
    this.stateMatrix = calendarAvails as CellState[][];
  }

  ngOnInit() {
    const state = this.state$.getValue();
    state.highlightedRange = this.rows.map(_ => this.columns.map(_ => false));

    this.state$.next(state);
  }

  onHover(row: number, column: number) {
    if (this.stateMatrix[row][column] === 'avail') {
      const state = this.state$.getValue();

      state.hoverColumn = column;
      state.hoverRow = row;

      if (state.selectionState === 'waiting' || state.selectionState === 'selected') {
        if (row === state.start.row && column === state.start.column) return; // don't put hover on start position
        if (row === state.end.row && column === state.end.column) return; // don't put hover on end position
        state.hoverStart = { row, column };

      } else if (state.selectionState === 'started') {

        if (row === state.start.row && column === state.start.column) return; // don't put hover on start position

        else if (this.isContinuous(state.start, { row, column })) {
          state.hoverEnd = { row, column };
          this.highlightRange(state.start, { row, column });

        } else {
          state.hoverStart = { row, column };
        }
      }

      this.state$.next(state);
    }
  }

  onExit() {
    const state = this.state$.getValue();

    if (state.selectionState !== 'selected') this.resetHighlight();
    state.hoverColumn = undefined;
    state.hoverRow = undefined;
    state.hoverStart = { row: undefined, column: undefined };
    state.hoverEnd = { row: undefined, column: undefined };

    this.state$.next(state);
  }

  select(row: number, column: number) {
    if (this.stateMatrix[row][column] !== 'avail') return;

    const state = this.state$.getValue();

    if (state.selectionState === 'waiting') {
      state.selectionState = 'started';
      state.start = { row, column };
      state.hoverStart = { row: undefined, column: undefined };

    } else if (state.selectionState === 'started') {

      if (this.isContinuous(state.start, { row, column })) {
        state.selectionState = 'selected';
        state.end = { row, column };
        state.hoverEnd = { row: undefined, column: undefined };
        // TODO EMIT OUTPUT

      } else {
        state.start = { row, column };
        state.hoverStart = { row: undefined, column: undefined };
      }
    } else {
      state.selectionState = 'started';
      state.start = { row, column };
      state.hoverStart = { row: undefined, column: undefined };
      state.hoverEnd = { row: undefined, column: undefined };
      state.end = { row: undefined, column: undefined };
    }

    this.state$.next(state);
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
  private isBefore(start: MatrixPosition, end: MatrixPosition) {
    return start.row < end.row || (start.row === end.row && start.column < end.column);
  }


  private isContinuous(start: MatrixPosition, end: MatrixPosition) {

    if (this.stateMatrix[start.row][start.column] !== 'avail') return false;
    if (this.stateMatrix[end.row][end.column] !== 'avail') return false;

    if (this.isBefore(end, start)) return false;


    // Checking if a range is continuous:
    // Ex:
    // | | |x|-|-|-|-|-|
    // |-|-|-|-|-|-|-|-|
    // |-|-|-|-|x| | | |

    for (let row = start.row ; row <= end.row ; row++) {

      // partial line: | | |x|-|-|-|x| |
      if (row === start.row && row === end.row) {
        for (let column = start.column ; column <= end.column ; column++) {
          if (this.stateMatrix[row][column] !== 'avail') return false;
        }

      // partial line (from start): | | |x|-|-|-|-|-|
      } else if (row === start.row) {
        for (let column = start.column ; column < this.columns.length ; column++) {
          if (this.stateMatrix[row][column] !== 'avail') return false;
        }

      // partial line (to end): |-|-|-|-|-|-|x| |
      } else if (row === end.row) {
        for (let column = 0 ; column <= end.column ; column++) {
          if (this.stateMatrix[row][column] !== 'avail') return false;
        }

      // full line: |-|-|-|-|-|-|-|-|
      } else {
        for (let column = 0 ; column < this.columns.length ; column++) {
          if (this.stateMatrix[row][column] !== 'avail') return false;
        }
      }
    }

    return true;
  }

  private resetHighlight(updateState = true) {
    const state = this.state$.getValue();

    state.highlightedRange = this.rows.map(_ => this.columns.map(_ => false));

    if (updateState) this.state$.next(state);

    return state;
  }

  private highlightRange(start: MatrixPosition, end: MatrixPosition) {
    const state = this.resetHighlight(false);

    for (let row = start.row ; row <= end.row ; row++) {
      for (let column = 0 ; column < this.columns.length ; column++) {
        if (
          (row === start.row && row === end.row && column >= start.column && column <= end.column) || // same line range
          (row === start.row && row !== end.row && column >= start.column) || // multi-line start-line
          (row !== start.row && row === end.row && column <= end.column) || // multi-line end-line
          (row > start.row && row < end.row) // multi-line full-line
        ) {
          state.highlightedRange[row][column] = true;
        }
      }
    }

    this.state$.next(state);
  }
}
