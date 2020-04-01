import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state/event.service';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { ViewComponent } from '../view/view.component';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'festival-marketplace-organization-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  events$ = this.query.selectAll();
  viewDate = new Date();

  constructor(
    private service: EventService,
    private query: EventQuery,
    private parent: ViewComponent
  ) { }

  ngOnInit(): void {
    this.sub = this.parent.org$.pipe(
      switchMap(org => this.service.syncScreenings(ref => ref.where('ownerId', '==', org.id)))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
