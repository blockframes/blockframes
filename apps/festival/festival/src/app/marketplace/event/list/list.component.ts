import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { EventQuery } from '@blockframes/event/+state/event.query';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  events$ = this.query.selectAll();
  viewDate = new Date();

  constructor(
    private service: EventService,
    private query: EventQuery,
  ) { }

  ngOnInit(): void {
    this.sub = this.service.syncScreenings().subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
