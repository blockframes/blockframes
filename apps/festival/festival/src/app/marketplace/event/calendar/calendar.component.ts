import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event } from '@blockframes/event/+state';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { map, switchMap, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { EventTypes } from '@blockframes/event/+state/event.firestore';

const typesLabel = {
  screening: 'Screenings',
  meeting: 'Meetings'
}

@Component({
  selector: 'festival-event-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCalendarComponent implements OnInit {
  typesLabel = typesLabel;
  types: EventTypes[] = ['screening', 'meeting'];
  filter = new FormControl(this.types);
  events$: Observable<Event[]>;
  viewDate = new Date();

  constructor(
    private service: EventService,
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const allEvents$ = this.invitationQuery.selectAll({
      // filterBy: ({ type, status }) => type === 'attendEvent' && ['accepted', 'pending'].includes(status)
      filterBy: ({ type, status }) => type === 'attendEvent' && status === 'accepted'
    }).pipe(
      map(invitations => invitations.map(i => i.docId)),
      map(eventIds => Array.from(new Set(eventIds))), // Remove duplicated
      switchMap(eventIds => this.service.queryDocs(eventIds))
    );
    const filters$ = this.filter.valueChanges.pipe(startWith(this.filter.value))

    this.events$ = combineLatest([allEvents$, filters$]).pipe(
      map(([events, types]) => events.filter(e => types.includes(e.type)))
    );
  }


  updateViewDate(date: Date) {
    this.viewDate = date;
    this.cdr.markForCheck();
  }

}
