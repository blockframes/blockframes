
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';

import { createMeetingAttendee, Event, EventQuery, EventService } from '@blockframes/event/+state';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { AuthQuery } from '@blockframes/auth/+state';
import { LocalAttendee, TrackKind } from '@blockframes/event/components/meeting/+state/twilio.model';
import { TwilioQuery } from '@blockframes/event/components/meeting/+state/twilio.query';
import { displayName } from '@blockframes/utils/utils';
import { AttendeeStatus, Meeting } from '@blockframes/event/+state/event.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;

  public local$: Observable<LocalAttendee>;

  public ownerIsPresent = false;
  public attendeeStatus: AttendeeStatus;

  private sub: Subscription;

  constructor(
    private authQuery: AuthQuery,
    private eventQuery: EventQuery,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private twilioService: TwilioService,
    private twilioQuery: TwilioQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.event$ = this.eventQuery.selectActive();
    this.local$ = this.twilioQuery.selectLocal();
    const name = displayName(this.authQuery.user);
    this.twilioService.initLocal(name);

    this.sub = this.event$.subscribe(event => {
      if (event.type === 'meeting') {
        this.dynTitle.setPageTitle(event.title, 'Lobby');
        const attendees = (event.meta as Meeting).attendees;
        this.ownerIsPresent = Object.values(attendees).some(value => value.status === 'owner');
        this.attendeeStatus = event.isOwner ? 'owner' : attendees[this.authQuery.userId]?.status;
        if (this.attendeeStatus === 'accepted') {
          this.router.navigate(['../', 'session'], { relativeTo: this.route });
        }
      }
    })
  }

  ngOnDestroy() {
    this.twilioService.cleanLocal();
    this.sub.unsubscribe();
  }

  toggleLocalTrack(kind: TrackKind) {
    this.twilioService.toggleTrack(kind);
    this.twilioService.togglePreference(kind); // save the user choice for the session page
  }

  requestAccess() {
    const uid = this.authQuery.userId;
    const attendee = createMeetingAttendee(this.authQuery.user, 'requesting');
    const event = this.eventQuery.getActive() as Event<Meeting>;
    const meta: Meeting = { ...event.meta, attendees: { ...event.meta.attendees, [uid]: attendee } };
    this.eventService.update(event.id, { meta });
  }
}
