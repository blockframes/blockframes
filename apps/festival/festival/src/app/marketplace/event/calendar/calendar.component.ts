import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event } from '@blockframes/event/+state';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { map, switchMap, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { eventTime } from '@blockframes/event/pipes/event-time.pipe';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';

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
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private agendaService: AgendaService
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('My Calendar');
    const allEvents$ = this.invitationQuery.selectAll({
      filterBy: ({ type, status }) => type === 'attendEvent' && ['accepted', 'pending'].includes(status)
    }).pipe(
      map(invitations => invitations.map(i => i.eventId)),
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

  hasUpcomingEvents(events: Event[] = []) {
    return events.some(e => eventTime(e) !== 'late');
  }

  exportToCalendar(events: Event[] = []) {
    this.agendaService.download(events.filter(e => eventTime(e) !== 'late'));
  }
}

@Pipe({ name: 'hideBadge' })
export class HideBadgePipe implements PipeTransform {
  constructor(private invitationQuery: InvitationQuery) { }
  transform(event: Event) {
    if (eventTime(event) === 'late') return of(true);
    return this.invitationQuery.selectEntity(i => i.eventId === event.id).pipe(
      map(i => i.status !== 'pending')
    );
  }
}