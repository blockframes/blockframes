import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { MarketplaceComponent } from '@blockframes/ui/layout/marketplace/marketplace.component';

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
    private marketplace: MarketplaceComponent,
    private service: EventService,
    private query: EventQuery,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sub = this.service.syncScreenings().subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  updateViewDate(date: Date) {
    this.viewDate = date;
    this.cdr.markForCheck();
  }

  toggleMenu() {
    this.marketplace.sidenav.toggle();
  }
}
