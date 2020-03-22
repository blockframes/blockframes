import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'event-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
  @Input() view = 'week';
  @Input() viewDate = new Date();
  @Input() events: CalendarEvent[];
  
  constructor() { }

}
