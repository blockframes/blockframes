import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { EventQuery, Event } from '@blockframes/event/+state';
import { Invitation } from '@blockframes/invitation/+state';
import { EventService } from '@blockframes/event/+state/event.service';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map, filter, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

const columns = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address'
};

@Component({
  selector: 'festival-event-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventReviewComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  event$: Observable<Event>;
  invitations$: Observable<Invitation[]>;
  analytics$ = this.query.analytics.selectActive().pipe(
    filter(analytics => !!analytics),
    map(analytics => analytics.eventUsers)
  );

  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private service: EventService,
    private query: EventQuery,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.sub = this.service.syncEventAnalytics().subscribe();
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
