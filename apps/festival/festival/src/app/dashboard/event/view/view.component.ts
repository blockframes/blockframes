import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { EventService } from '@blockframes/event/+state/event.service';
import { Observable, Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'festival-event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent implements OnInit, OnDestroy {

  event$ = this.query.selectActive();
  invitations$: Observable<Invitation[]>;
  analytics$ = this.query.analytics.selectActive();
  sub: Subscription;

  public columns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address'
  };
  public initialColumns = Object.keys(this.columns);

  constructor(
    private service: EventService,
    private query: EventQuery,
    private invitationService: InvitationService,
  ) { }

  ngOnInit() {
    this.sub = this.service.syncEventAnalytics().subscribe();
    this.invitations$ = this.query.selectActiveId().pipe(
      switchMap(eventId => this.invitationService.valueChanges(ref => ref.where('docId', '==', eventId)))
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
