
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { createMeetingAttendee, Event, EventService } from '@blockframes/event/+state';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { LocalAttendee, TrackKind } from '@blockframes/event/components/meeting/+state/twilio.model';
import { TwilioQuery } from '@blockframes/event/components/meeting/+state/twilio.query';
import { displayName } from '@blockframes/utils/utils';
import { AttendeeStatus, Meeting } from '@blockframes/event/+state/event.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'event-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;
  private event: Event<Meeting>;
  public local$: Observable<LocalAttendee>;
  public ownerIsPresent = false;
  public attendeeStatus: AttendeeStatus;
  private sub: Subscription;

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private twilioService: TwilioService,
    private twilioQuery: TwilioQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.eventService.valueChanges(eventId)),
    );

    this.local$ = this.twilioQuery.selectLocal();
    const name = displayName(this.authQuery.user || this.authService.anonymousCredentials);
    this.twilioService.initLocal(name);

    this.sub = this.event$.subscribe((e) => {
      this.event = e as Event<Meeting>;
      if (this.event.type === 'meeting') {
        this.dynTitle.setPageTitle(this.event.title, 'Lobby');
        const attendees = (this.event.meta as Meeting).attendees;
        this.ownerIsPresent = Object.values(attendees).some(value => value.status === 'owner');
        this.attendeeStatus = this.event.isOwner ? 'owner' : attendees[this.authQuery.userId || this.authService.anonymousUserId]?.status;
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
    const uid = this.authQuery.userId || this.authService.anonymousUserId;
    const attendee = createMeetingAttendee(this.authQuery.user || this.authService.anonymousCredentials, 'requesting');
    const meta: Meeting = { ...this.event.meta, attendees: { ...this.event.meta.attendees, [uid]: attendee } };
    this.eventService.update(this.event.id, { meta });
  }
}
