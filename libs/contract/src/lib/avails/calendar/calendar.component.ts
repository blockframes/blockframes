
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import {
  hover,
  reset,
  select,
  CellState,
  calendarRows,
  highlightRange,
  calendarColumns,
  markersToMatrix,
  AvailCalendarState,
  dateToMatrixPosition,
  createAvailCalendarState,
} from './calendar.model';
import { DurationMarker } from '../avails';
import { boolean } from '@blockframes/utils/decorators/decorators';

/** Available [A], Today[T], Expired[E]
*               A.from       A.to
*   xxxxxxxxxxxxx|------T-----|xxxxxx
*   xxxxxxxxxxxxx|ooooo|------|xxxxxx
*              E.from  E.to
*
* Determines date ranges amongst the available markers that are already in the past.
*/
function getExpiredMarkers(availableMarkers: DurationMarker[]) {
  const today = new Date();
  const previousMonthDate = new Date();
  previousMonthDate.setDate(0); // sets date to last date of previous month.
  const isJanuary = previousMonthDate.getFullYear() < new Date().getFullYear();
  if (isJanuary) return []; // No expired markers in January
  return availableMarkers.filter(marker => marker.from < today).map(marker => ({ ...marker, to: previousMonthDate }));
}


@Component({
  selector: 'avails-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailsCalendarComponent implements OnInit {

  public columns = calendarColumns;
  public rows = calendarRows;

  public stateMatrix: CellState[][] = this.rows.map(() => this.columns.map(() => 'empty'));

  public state$ = new BehaviorSubject<AvailCalendarState>(createAvailCalendarState());

  private _availableMarkers: DurationMarker[] = [];
  private _expiredMarkers: DurationMarker[] = [];
  private _soldMarkers: DurationMarker[] = [];
  private _inSelectionMarkers: DurationMarker[] = [];
  private _selectedMarker?: DurationMarker;

  /** Includes available, sold, selected, and in selection markers */
  @Input() set availableMarkers(markers: DurationMarker[] | undefined) {
    if (!markers) return;
    const startOfYear = new Date(new Date().getFullYear(), 0); // January of current year.
    this._availableMarkers = markers.filter(marker => marker.to > startOfYear);
    this._expiredMarkers = getExpiredMarkers(this._availableMarkers);
    this.updateMatrix();
  }

  @Input() set soldMarkers(markers: DurationMarker[] | undefined) {
    if (!markers) return;
    const startOfYear = new Date(new Date().getFullYear(), 0);
    this._soldMarkers = markers.filter(marker => marker.to > startOfYear);
    this.updateMatrix();
  }

  @Input() set inSelectionMarkers(markers: DurationMarker[] | undefined) {
    if (!markers) return;
    this._inSelectionMarkers = markers;
    this.updateMatrix();
  }

  @Input() set selectedMarker(marker: DurationMarker | undefined) {
    this._selectedMarker = marker;
    this.updateMatrix();
  }

  @Input() @boolean disableSelect = false;

  @Output() selected = new EventEmitter<DurationMarker>();

  ngOnInit() {
    const state = this.state$.getValue();

    this.state$.next(state);
  }

  updateMatrix() {

    // set available/sold/selected blocks into the stateMatrix (this will display the colored rectangles)
    let matrix: CellState[][] = this.rows.map(() => this.columns.map(() => 'empty'));
    if (this._availableMarkers.length) matrix = markersToMatrix(this._availableMarkers, matrix, 'available');
    if (this._soldMarkers.length) matrix = markersToMatrix(this._soldMarkers, matrix, 'sold');
    if (this._inSelectionMarkers.length) matrix = markersToMatrix(this._inSelectionMarkers, matrix, 'selected');
    if (this._expiredMarkers.length) matrix = markersToMatrix(this._expiredMarkers, matrix, 'expired');
    this.stateMatrix = matrix;

    const currentState = this.state$.getValue();
    currentState.selectionState = 'waiting';
    const resetState = reset(currentState, this.stateMatrix);

    // if no current selection: reset the selection
    if (!this._selectedMarker) {
      this.state$.next(resetState);

      // if there is a current selection: set the selection into the calendar inner state
    } else {

      // compute selection start & end position
      const selectionStart = dateToMatrixPosition(this._selectedMarker.from);
      const selectionEnd = dateToMatrixPosition(this._selectedMarker.to);

      // "simulate" user click
      const newSelectStateStart = select(selectionStart.row, selectionStart.column, this.stateMatrix, resetState);
      const newSelectStateEnd = select(selectionEnd.row, selectionEnd.column, this.stateMatrix, newSelectStateStart);
      const newSelectState = highlightRange(selectionStart, selectionEnd, this.stateMatrix, newSelectStateEnd);

      this.state$.next(newSelectState);
    }
  }

  onHover(row: number, column: number) {
    if (this.disableSelect) return;
    const state = this.state$.getValue();
    const newState = hover(row, column, this.stateMatrix, state);
    this.state$.next(newState);
  }

  onExit() {
    if (this.disableSelect) return;
    const state = this.state$.getValue();
    const newState = reset(state, this.stateMatrix);
    this.state$.next(newState);
  }

  onSelect(row: number, column: number) {
    if (this.disableSelect) return;
    const state = this.state$.getValue();

    // Prevent user to end selection on the same month as the start month (i.e. selection must be at least 2 month long)
    if (
      state.selectionState === 'started' &&
      state.start.row === row &&
      state.start.column === column
    ) return;

    const newState = select(row, column, this.stateMatrix, state);
    this.state$.next(newState);
    if (newState.selectionState === 'selected') {
      const year = new Date().getFullYear();
      const from = new Date(year + newState.start.row, newState.start.column);
      const to = new Date(year + newState.end.row, newState.end.column);
      const parentMarker = this._availableMarkers.find(marker => {
        // From the calendar pov range starts at the first day of the month
        // but the avail term might not start at the first day of the month
        const markerFromYear = marker.from.getFullYear();
        const markerFromMonth = marker.from.getMonth();
        const startDate = new Date(markerFromYear, markerFromMonth, 1).getTime();
        return startDate <= from.getTime() && marker.to >= to;
      });

      if (!parentMarker) throw new Error('Calendar Invalid Selection: a selection must be included in a marker!');

      this.selected.emit({ from, to, term: parentMarker.term, contract: parentMarker.contract });
    }
  }
}
