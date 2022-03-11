import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { map, switchMap, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { eventTime } from '@blockframes/event/pipes/event-time.pipe';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';
import { Event, EventTypes } from '@blockframes/model';

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
    private invitationService: InvitationService,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private agendaService: AgendaService
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('My Calendar');

    const isWillingToAttendEvent = (i: Invitation) =>  i.type === 'attendEvent' && ['accepted', 'pending'].includes(i.status);
    const allEvents$ = this.invitationService.allInvitations$.pipe(
      map(invitations => invitations.filter(isWillingToAttendEvent)),
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
  constructor(private invitationService: InvitationService) { }
  transform(event: Event) {
    if (eventTime(event) === 'late') return of(true);
    return this.invitationService.allInvitations$.pipe(
      map(invitations => invitations.some(i => i.eventId === event.id && i.status !== 'pending'))
    )
  }
}