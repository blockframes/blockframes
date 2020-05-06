import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event } from '@blockframes/event/+state';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { map, switchMap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'festival-event-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCalendarComponent implements OnInit {
  events$: Observable<Event[]>;
  viewDate = new Date();

  constructor(
    private service: EventService,
    private authQuery: AuthQuery,
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // @todo(#2711) Should take into account user & org ownerId
    // Event to which user is invited
    const invited$ = this.invitationQuery.selectAll({
      filterBy: ({ type, status }) => type === 'attendEvent' && status === 'accepted'
    }).pipe(
      map(invitations => invitations.map(i => i.docId)),
      switchMap(eventIds => this.service.valueChanges(eventIds))
    );
    // Event that user owned
    const owned$ = this.authQuery.select('uid').pipe(
      switchMap(uid => this.service.queryByType(['meeting'], ref => ref.where('ownerId', '==', uid)))
    );
    this.events$ = combineLatest([invited$, owned$]).pipe(
      map(events => events.flat())
    );
  }


  updateViewDate(date: Date) {
    this.viewDate = date;
    this.cdr.markForCheck();
  }

}
