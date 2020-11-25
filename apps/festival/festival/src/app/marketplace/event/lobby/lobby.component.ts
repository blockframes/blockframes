
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';

import { Event, EventQuery, EventService } from '@blockframes/event/+state';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { AuthQuery } from '@blockframes/auth/+state';
import { LocalAttendee, TrackKind } from '@blockframes/event/components/meeting/+state/twilio.model';
import { TwilioQuery } from '@blockframes/event/components/meeting/+state/twilio.query';
import { displayName } from '@blockframes/utils/utils';
import { AttendeeStatus, Meeting } from '@blockframes/event/+state/event.firestore';

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
  ) { }

  ngOnInit() {
    this.event$ = this.eventQuery.selectActive();
    this.local$ = this.twilioQuery.selectLocal();
    const name = displayName(this.authQuery.user);
    this.twilioService.initLocal(name);

    this.sub = this.event$.subscribe(event => {
      if (event.type === 'meeting') {
        const attendees = (event.meta as Meeting).attendees;
        const values = Object.keys(attendees).map(key => attendees[key]);
        const uid = this.authQuery.userId;
        this.ownerIsPresent = values.some(value => value === 'owner');
        this.attendeeStatus = event.isOwner ? 'owner' : attendees[uid];
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
  }

  requestAccess(event: Event) {
    const uid = this.authQuery.userId;
    const meta: Meeting = { ...event.meta, attendees: { ...event.meta.attendees, [uid]: 'requesting' }};
    this.eventService.update(event.id, { meta });
  }
}
