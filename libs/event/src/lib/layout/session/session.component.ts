import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { EventQuery, Event } from '@blockframes/event/+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'event-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventSessionComponent implements OnInit {

  event$: Observable<Event>;

  constructor(
    private query: EventQuery,
  ) {}

  ngOnInit() {
    this.event$ = this.query.selectActive();
  }
}
