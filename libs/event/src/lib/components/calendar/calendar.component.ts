import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { EventQuery } from '@blockframes/event/+state/event.query';

@Component({
  selector: 'event-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
  @Input() view = 'week';
  @Input() viewDate = new Date();
  events$ = this.query.selectAll();
  
  constructor(private query: EventQuery) { }

}
