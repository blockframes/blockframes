
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { DurationMarker } from '../avails';
import { calendarAvails } from '../fixtures/calendar';
import { AvailCalendarState, CellState, hover, markersToMatrix, reset, select } from './calendar.model';



@Component({
  selector: 'avails-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: [ './calendar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailsCalendarComponent implements OnInit {

  public columns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  public rows = Array(10).fill(0).map((_,i) => new Date().getFullYear() + i); // [ 2021, 2022, ... 2030 ]

  public stateMatrix: CellState[][] = this.rows.map(_ => this.columns.map(__ => 'empty'));

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

  @Input() set availableMarkers(markers: DurationMarker[] | undefined) {
    if (!markers) return;
    this.stateMatrix = markersToMatrix(markers, this.stateMatrix, 'avail');
  }

  @Input() set soldMarkers(markers: DurationMarker[] | undefined) {
    if (!markers) return;
    this.stateMatrix = markersToMatrix(markers, this.stateMatrix, 'sold');
  }

  ngOnInit() {
    const state = this.state$.getValue();
    state.highlightedRange = this.rows.map(_ => this.columns.map(__ => false));

    this.state$.next(state);
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
    // TODO EMIT OUTPUT IF NEW SELECTION STATE IS 'SELECTED'
    this.state$.next(newState);
  }
}
