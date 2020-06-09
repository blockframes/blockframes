import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Event } from '@blockframes/event/+state';
import { Invitation } from '@blockframes/invitation/+state';
import { EventService } from '@blockframes/event/+state/event.service';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map, filter, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { EventAnalytics } from '@blockframes/event/+state/event.firestore';

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
export class EventReviewComponent implements OnInit {

  private sub: Subscription;
  event$: Observable<Event>;
  invitations$: Observable<Invitation[]>;
  analytics$ : Observable<EventAnalytics[]>;
  eventId$: Observable<string>;

  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private service: EventService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.eventId$ = this.route.params.pipe(pluck('eventId'));

    this.analytics$ = this.eventId$.pipe(
      switchMap((eventId: string) => this.service.queryAnalytics(eventId)),
      filter(analytics => !!analytics),
      map(analytics => analytics.eventUsers)
    );

    this.event$ = this.eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    );
  }
}
