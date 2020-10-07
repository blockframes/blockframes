import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event } from '@blockframes/event/+state';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { map, switchMap, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

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
  public hidden: boolean;

  constructor(
    private service: EventService,
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('My Calendar');
    const allEvents$ = this.invitationQuery.selectAll({
      filterBy: ({ type, status }) => type === 'attendEvent' && ['accepted', 'pending'].includes(status)
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

  // Hide the matBadge if invitation to the event isn't pending anymore
  isHidden(event: Event) {
    const invitation$ = this.invitationQuery.selectEntity(i => i.docId === event.id);
    invitation$.subscribe(i => i.status === 'pending' ? this.hidden = false : this.hidden = true);
    return this.hidden;
  }

}
