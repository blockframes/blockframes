
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import {
  hover,
  reset,
  select,
  CellState,
  calendarRows,
  highlightRange,
  resetHighlight,
  calendarColumns,
  markersToMatrix,
  AvailCalendarState,
  dateToMatrixPosition,
  createAvailCalendarState,
} from './calendar.model';
import { DurationMarker } from '../avails';


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

  private _licensedMarkers: DurationMarker[] = [];
  private _soldMarkers: DurationMarker[] = [];

  /** Includes available, sold, selected, and in selection markers */
  @Input() set licensedMarkers(markers: DurationMarker[] | undefined) {
    if (!markers) return;
    this._licensedMarkers = markers;
    this.updateMatrix();
  }

  @Input() set soldMarkers(markers: DurationMarker[] | undefined) {
    if (!markers) return;
    this._soldMarkers = markers;
    this.updateMatrix();
  }

  @Input() set selectedMarker(marker: DurationMarker| undefined) {
    const state = this.state$.getValue();

    if (!marker) {
      state.selectionState = 'waiting';
      state.start = { row: undefined, column: undefined };
      state.end = { row: undefined, column: undefined };
      const resetState = reset(state);
      this.state$.next(resetState);
      return;
    }

    const selectionStart = dateToMatrixPosition(marker.from);
    const selectionEnd = dateToMatrixPosition(marker.to);


    state.selectionState = 'waiting';
    const newStateStart = select(selectionStart.row, selectionStart.column, this.stateMatrix, state);
    const newStateEnd = select(selectionEnd.row, selectionEnd.column, this.stateMatrix, newStateStart);
    const newState = highlightRange(selectionStart, selectionEnd, this.stateMatrix, newStateEnd);
    this.state$.next(newState);
  }

  @Output() selected = new EventEmitter<DurationMarker>();

  ngOnInit() {
    const state = this.state$.getValue();
    state.highlightedRange = this.rows.map(() => this.columns.map(() => false));

    this.state$.next(state);
  }

  updateMatrix() {
    const currentState = this.state$.getValue();
    const resetedHighlight = resetHighlight(currentState);
    const newState = createAvailCalendarState({ highlightedRange: resetedHighlight.highlightedRange })
    this.state$.next(newState);

    let matrix: CellState[][] = this.rows.map(() => this.columns.map(() => 'empty'));
    if (this._licensedMarkers.length) matrix = markersToMatrix(this._licensedMarkers, this.stateMatrix, 'available');
    if (this._soldMarkers.length) matrix = markersToMatrix(this._soldMarkers, this.stateMatrix, 'sold');
    this.stateMatrix = matrix;
  }

  onHover(row: number, column: number) {
    const state = this.state$.getValue();
    const newState = hover(row, column, this.stateMatrix, state);
    this.state$.next(newState);
  }

  onExit() {
    const state = this.state$.getValue();
    const newState = reset(state);
    this.state$.next(newState);
  }

  onSelect(row: number, column: number) {
    const state = this.state$.getValue();
    const newState = select(row, column, this.stateMatrix, state);
    this.state$.next(newState);
    if (newState.selectionState === 'selected') {
      const year = new Date().getFullYear();
      const from = new Date(year + newState.start.row, newState.start.column);
      const to = new Date(year + newState.end.row, newState.end.column);

      let parentMarker = this._licensedMarkers.find(marker => marker.from <= from && marker.to >= to);

      if (!parentMarker) throw new Error(`Calendar Invalid Selection: a selection must be included in a marker!`);

      this.selected.emit({ from, to, term: parentMarker.term, contract: parentMarker.contract });
    }
  }
}
