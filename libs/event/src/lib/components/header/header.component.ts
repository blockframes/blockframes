import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

type CalendarView = 'month' | 'week' | 'day';

@Component({
  selector: 'cal-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarHeaderComponent {
  @Input() view: CalendarView = 'week';
  @Input() viewDate = new Date();
  @Output() viewChange: EventEmitter<CalendarView> = new EventEmitter();
  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();
}
