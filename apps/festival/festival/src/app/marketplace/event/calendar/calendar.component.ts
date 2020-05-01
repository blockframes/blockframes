import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event } from '@blockframes/event/+state';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { map, switchMap } from 'rxjs/operators';

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
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.events$ = this.invitationQuery.selectAll({
      filterBy: ({ type, status }) => type === 'attendEvent' && status === 'accepted'
    }).pipe(
      map(invitations => invitations.map(i => i.docId)),
      switchMap(eventIds => this.service.valueChanges(eventIds))
    );
  }


  updateViewDate(date: Date) {
    this.viewDate = date;
    this.cdr.markForCheck();
  }

}
