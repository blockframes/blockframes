import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state/event.service';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { Subscription } from 'rxjs';

@Component({
  selector: 'festival-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  events$ = this.query.selectAll();
  viewDate = new Date();

  constructor(private service: EventService, private query: EventQuery) { }

  ngOnInit(): void {
    this.sub = this.service.syncCollection().subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
