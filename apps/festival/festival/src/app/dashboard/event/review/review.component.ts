import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { EventService } from '@blockframes/event/+state/event.service';
import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

  event$ = this.query.selectActive();
  invitations$: Observable<Invitation[]>;
  analytics$ = this.query.analytics.selectActive();
  sub: Subscription;

  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private service: EventService,
    private query: EventQuery,
    private invitationService: InvitationService,
  ) { }

  ngOnInit() {
    this.sub = this.service.syncEventAnalytics().subscribe();

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
