
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { DurationMarker } from '../avails';
import {
  AvailCalendarState,
  calendarColumns,
  calendarRows,
  CellState,
  createAvailCalendarState,
  hover,
  markersToMatrix,
  reset,
  select
} from './calendar.model';
import { Duration } from '../../term/+state/term.model';


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
  /** Includes available, sold, selected, and inselection markers */
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

  @Output() selected = new EventEmitter<Duration<Date>>();

  ngOnInit() {
    const state = this.state$.getValue();
    state.highlightedRange = this.rows.map(() => this.columns.map(() => false));

    this.state$.next(state);
  }

  updateMatrix() {
    this.stateMatrix = this.rows.map(_ => this.columns.map(__ => 'empty'));
    if (this._licensedMarkers.length) this.stateMatrix = markersToMatrix(this._licensedMarkers, this.stateMatrix, 'available');
    if (this._soldMarkers.length) this.stateMatrix = markersToMatrix(this._soldMarkers, this.stateMatrix, 'sold');
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
      this.selected.emit({ from, to });
    }
  }
}
